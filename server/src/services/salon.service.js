/**
 * Salon service - handles salon event management and registration
 */
const { Op } = require('sequelize');
const { User, SalonEvent, SalonRegistration, Member, Matchmaker } = require('../models');
const messageService = require('./message.service');
const logger = require('../utils/logger');

const salonService = {
  /**
   * Get paginated events list with optional status filter
   */
  async getEvents(filters = {}) {
    const { page = 1, pageSize = 20, status } = filters;

    const where = {};
    if (status) {
      where.status = status;
    }

    const { count, rows } = await SalonEvent.findAndCountAll({
      where,
      include: [{
        association: 'organizer',
        attributes: ['id', 'nickname', 'avatarUrl']
      }],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['event_date', 'ASC']],
      distinct: true
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * Get event detail with registrations count
   */
  async getEventDetail(eventId) {
    const event = await SalonEvent.findByPk(eventId, {
      include: [
        {
          association: 'organizer',
          attributes: ['id', 'nickname', 'avatarUrl']
        },
        {
          association: 'registrations',
          where: { status: 'registered' },
          required: false,
          include: [{
            association: 'user',
            attributes: ['id', 'nickname', 'avatarUrl', 'gender']
          }]
        }
      ]
    });

    return event;
  },

  /**
   * Register a user for a salon event
   * Checks capacity and prevents duplicate registration
   */
  async registerForEvent(eventId, userId) {
    // Verify event exists and is upcoming
    const event = await SalonEvent.findByPk(eventId);
    if (!event) {
      throw new Error('活动不存在');
    }

    if (event.status !== 'upcoming') {
      throw new Error('活动当前不可报名');
    }

    // Check capacity (0 means unlimited)
    if (event.maxParticipants > 0 && event.currentParticipants >= event.maxParticipants) {
      throw new Error('活动名额已满');
    }

    // Check for existing registration
    const existing = await SalonRegistration.findOne({
      where: { eventId, userId, status: 'registered' }
    });

    if (existing) {
      throw new Error('您已报名该活动');
    }

    // Check for cancelled registration and reactivate
    const cancelled = await SalonRegistration.findOne({
      where: { eventId, userId, status: 'cancelled' }
    });

    let registration;
    if (cancelled) {
      await cancelled.update({ status: 'registered' });
      registration = cancelled;
    } else {
      registration = await SalonRegistration.create({
        eventId,
        userId,
        status: 'registered'
      });
    }

    // Increment participant count
    await event.increment('currentParticipants');

    // Notify the organizer
    try {
      const user = await User.findByPk(userId, { attributes: ['nickname'] });
      await messageService.sendMessage(
        userId,
        event.organizerId,
        `[报名通知] ${user?.nickname || '用户'}报名了您的沙龙活动「${event.title}」`,
        'system'
      );
    } catch (e) {
      logger.warn(`Failed to notify organizer about registration: ${e.message}`);
    }

    logger.info(`User ${userId} registered for salon event ${eventId}`);
    return registration;
  },

  /**
   * Cancel a user's registration for a salon event
   */
  async cancelRegistration(eventId, userId) {
    const registration = await SalonRegistration.findOne({
      where: { eventId, userId, status: 'registered' }
    });

    if (!registration) {
      throw new Error('未找到报名记录');
    }

    await registration.update({ status: 'cancelled' });

    // Decrement participant count
    const event = await SalonEvent.findByPk(eventId);
    if (event && event.currentParticipants > 0) {
      await event.decrement('currentParticipants');
    }

    logger.info(`User ${userId} cancelled registration for salon event ${eventId}`);
    return registration;
  },

  /**
   * Get a user's registered events with pagination
   */
  async getMyRegistrations(userId, page = 1, pageSize = 20) {
    const { count, rows } = await SalonRegistration.findAndCountAll({
      where: { userId, status: { [Op.ne]: 'cancelled' } },
      include: [{
        association: 'event',
        include: [{
          association: 'organizer',
          attributes: ['id', 'nickname', 'avatarUrl']
        }]
      }],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']]
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * Create a new salon event (matchmaker only)
   */
  async createEvent(organizerId, data) {
    const { title, description, coverImage, location, eventDate, maxParticipants, price } = data;

    if (!title || !eventDate) {
      throw new Error('活动标题和时间为必填项');
    }

    const event = await SalonEvent.create({
      title,
      description: description || '',
      coverImage: coverImage || null,
      location: location || '',
      eventDate: new Date(eventDate),
      maxParticipants: maxParticipants || 0,
      price: price || 0,
      organizerId,
      status: 'upcoming',
      currentParticipants: 0
    });

    logger.info(`Matchmaker ${organizerId} created salon event ${event.id}: ${title}`);
    return event;
  },

  /**
   * Update a salon event (only by its organizer)
   */
  async updateEvent(eventId, organizerId, data) {
    const event = await SalonEvent.findByPk(eventId);
    if (!event) throw new Error('活动不存在');
    if (event.organizerId !== organizerId) throw new Error('无权修改此活动');
    if (event.status === 'ended' || event.status === 'cancelled') {
      throw new Error('已结束或已取消的活动不能修改');
    }

    const updateFields = {};
    ['title', 'description', 'coverImage', 'location', 'eventDate', 'maxParticipants', 'price'].forEach(f => {
      if (data[f] !== undefined) {
        updateFields[f] = f === 'eventDate' ? new Date(data[f]) : data[f];
      }
    });

    await event.update(updateFields);
    logger.info(`Salon event ${eventId} updated by organizer ${organizerId}`);
    return event;
  },

  /**
   * Cancel a salon event (only by its organizer)
   */
  async cancelEvent(eventId, organizerId) {
    const event = await SalonEvent.findByPk(eventId);
    if (!event) throw new Error('活动不存在');
    if (event.organizerId !== organizerId) throw new Error('无权取消此活动');
    if (event.status === 'cancelled') throw new Error('活动已取消');
    if (event.status === 'ended') throw new Error('已结束的活动不能取消');

    await event.update({ status: 'cancelled' });

    // Notify all registered users
    const registrations = await SalonRegistration.findAll({
      where: { eventId, status: 'registered' }
    });

    for (const reg of registrations) {
      try {
        await messageService.sendMessage(
          organizerId,
          reg.userId,
          `[活动取消] 沙龙活动「${event.title}」已取消，给您带来不便敬请谅解。`,
          'system'
        );
      } catch (e) {
        logger.warn(`Failed to notify user ${reg.userId} about event cancellation: ${e.message}`);
      }
    }

    logger.info(`Salon event ${eventId} cancelled by organizer ${organizerId}`);
    return event;
  },

  /**
   * Get events created by a specific organizer
   */
  async getMyEvents(organizerId, page = 1, pageSize = 20) {
    const { count, rows } = await SalonEvent.findAndCountAll({
      where: { organizerId },
      include: [{
        association: 'organizer',
        attributes: ['id', 'nickname', 'avatarUrl']
      }],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * Invite members to a salon event
   * Only the organizer can invite, and only their own members
   */
  async inviteMembers(eventId, organizerId, userIds) {
    const event = await SalonEvent.findByPk(eventId);
    if (!event) throw new Error('活动不存在');
    if (event.organizerId !== organizerId) throw new Error('无权邀请人员参加此活动');
    if (event.status !== 'upcoming') throw new Error('只能邀请参加即将开始的活动');

    // Get the matchmaker record for the organizer
    const matchmaker = await Matchmaker.findOne({ where: { userId: organizerId } });
    if (!matchmaker) throw new Error('红娘信息不存在');

    // Verify all userIds belong to this matchmaker's members
    const members = await Member.findAll({
      where: {
        matchmakerId: matchmaker.id,
        userId: { [Op.in]: userIds },
        status: 1
      }
    });

    const validUserIds = members.map(m => m.userId);
    if (validUserIds.length === 0) throw new Error('未找到有效的会员');

    // Send invitation message to each valid member, skip already registered
    const results = { invited: 0, alreadyRegistered: 0, failed: 0 };

    for (const uid of validUserIds) {
      try {
        // Check if already registered
        const existing = await SalonRegistration.findOne({
          where: { eventId, userId: uid, status: 'registered' }
        });
        if (existing) {
          results.alreadyRegistered++;
          continue;
        }

        await messageService.sendMessage(
          organizerId,
          uid,
          `[沙龙邀请] 您被邀请参加沙龙活动「${event.title}」，时间：${new Date(event.eventDate).toLocaleDateString('zh-CN')}，地点：${event.location || '待定'}。快来报名参加吧！`,
          'system'
        );
        results.invited++;
      } catch (e) {
        logger.warn(`Failed to invite user ${uid} to event ${eventId}: ${e.message}`);
        results.failed++;
      }
    }

    logger.info(`Invited ${results.invited} members to salon event ${eventId} by organizer ${organizerId}`);
    return results;
  }
};

module.exports = salonService;
