const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const queryInterface = sequelize.getQueryInterface();

async function tableExists(tableName) {
  const tables = await queryInterface.showAllTables();
  return tables.map(String).includes(tableName);
}

async function getTableDescription(tableName) {
  if (!(await tableExists(tableName))) return null;
  return queryInterface.describeTable(tableName);
}

async function addColumnIfMissing(tableName, columnName, definition) {
  const table = await getTableDescription(tableName);
  if (!table || table[columnName]) return;
  await queryInterface.addColumn(tableName, columnName, definition);
  console.log(`Added column ${tableName}.${columnName}`);
}

async function addIndexIfMissing(tableName, indexName, fields, options = {}) {
  if (!(await tableExists(tableName))) return;
  const indexes = await queryInterface.showIndex(tableName);
  if (indexes.some(index => index.name === indexName)) return;
  await queryInterface.addIndex(tableName, fields, { ...options, name: indexName });
  console.log(`Added index ${tableName}.${indexName}`);
}

async function createSalonTables() {
  if (!(await tableExists('salon_events'))) {
    await queryInterface.createTable('salon_events', {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(100), allowNull: false },
      description: { type: DataTypes.TEXT },
      cover_image: { type: DataTypes.STRING(500) },
      location: { type: DataTypes.STRING(200) },
      event_date: { type: DataTypes.DATE, allowNull: false },
      max_participants: { type: DataTypes.INTEGER, defaultValue: 0 },
      current_participants: { type: DataTypes.INTEGER, defaultValue: 0 },
      price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      organizer_id: {
        type: DataTypes.BIGINT,
        references: { model: 'users', key: 'id' }
      },
      status: {
        type: DataTypes.ENUM('upcoming', 'ongoing', 'ended', 'cancelled'),
        defaultValue: 'upcoming'
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });
    console.log('Created table salon_events');
  }

  if (!(await tableExists('salon_registrations'))) {
    await queryInterface.createTable('salon_registrations', {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      event_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: 'salon_events', key: 'id' }
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      status: {
        type: DataTypes.ENUM('registered', 'attended', 'cancelled'),
        defaultValue: 'registered'
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });
    await addIndexIfMissing('salon_registrations', 'uk_event_user', ['event_id', 'user_id'], { unique: true });
    console.log('Created table salon_registrations');
  }
}

async function createUserCertificationsTable() {
  if (await tableExists('user_certifications')) return;

  await queryInterface.createTable('user_certifications', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    real_name: { type: DataTypes.STRING(32) },
    id_card: { type: DataTypes.STRING(18) },
    id_front_photo: { type: DataTypes.STRING(500) },
    id_back_photo: { type: DataTypes.STRING(500) },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    reject_reason: { type: DataTypes.STRING(255) },
    submitted_at: { type: DataTypes.DATE },
    reviewed_at: { type: DataTypes.DATE },
    reviewer_id: { type: DataTypes.BIGINT },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  await addIndexIfMissing('user_certifications', 'idx_user_id', ['user_id']);
  await addIndexIfMissing('user_certifications', 'idx_status', ['status']);
  await addIndexIfMissing('user_certifications', 'idx_submitted_at', ['submitted_at']);
  console.log('Created table user_certifications');
}

async function migrate() {
  await sequelize.authenticate();

  await createSalonTables();

  await addColumnIfMissing('users', 'username', {
    type: DataTypes.STRING(32),
    unique: true,
    comment: '用户名，用于账号密码登录',
    after: 'id'
  });
  await addColumnIfMissing('users', 'is_admin', {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '0-normal user, 1-admin',
    after: 'status'
  });
  await addIndexIfMissing('users', 'idx_is_admin', ['is_admin']);

  await addColumnIfMissing('users', 'certification_status', {
    type: DataTypes.ENUM('none', 'pending', 'approved', 'rejected'),
    defaultValue: 'none',
    comment: '实名认证状态',
    after: 'is_verified'
  });
  await createUserCertificationsTable();

  await addColumnIfMissing('users', 'deleted_at', {
    type: DataTypes.DATE,
    allowNull: true,
    after: 'updated_at'
  });
  await addColumnIfMissing('matchmakers', 'deleted_at', {
    type: DataTypes.DATE,
    allowNull: true,
    after: 'updated_at'
  });
  await addIndexIfMissing('users', 'idx_users_deleted_at', ['deleted_at']);
  await addIndexIfMissing('matchmakers', 'idx_matchmakers_deleted_at', ['deleted_at']);

  console.log('Migrations completed');
}

migrate()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });