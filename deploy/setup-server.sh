#!/bin/bash
# ==========================================
# 婚恋平台 - 腾讯云 CVM 一键初始化脚本
# 适用于 Ubuntu 22.04 / Debian 12
# 以 root 用户运行: bash deploy/setup-server.sh
# ==========================================

set -e

# ---------- 配置项 ----------
PROJECT_DIR="/opt/hl"
DEPLOY_USER="deploy"
SSL_DIR="$PROJECT_DIR/ssl"
GITHUB_REPO=""  # 填入 GitHub 仓库地址，如 git@github.com:username/hl.git

# ---------- 颜色输出 ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ---------- 检查 root 权限 ----------
if [ "$(id -u)" -ne 0 ]; then
  error "请以 root 用户运行此脚本: sudo bash $0"
fi

echo "=========================================="
echo "  婚恋平台 - 腾讯云服务器初始化"
echo "=========================================="
echo ""

# ===========================================
# 1. 系统更新 & 基础工具
# ===========================================
info "1/7 更新系统包..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget git ufw apt-transport-https ca-certificates gnupg lsb-release

# ===========================================
# 2. 安装 Docker
# ===========================================
if ! command -v docker &>/dev/null; then
  info "2/7 安装 Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  info "Docker 已安装: $(docker --version)"
else
  info "2/7 Docker 已存在: $(docker --version)"
fi

# 确保 Docker Compose V2 可用
if ! docker compose version &>/dev/null; then
  info "安装 Docker Compose 插件..."
  apt-get install -y -qq docker-compose-plugin
fi
info "Docker Compose: $(docker compose version)"

# ===========================================
# 3. 创建部署用户
# ===========================================
if ! id "$DEPLOY_USER" &>/dev/null; then
  info "3/7 创建部署用户: $DEPLOY_USER"
  useradd -m -s /bin/bash "$DEPLOY_USER"
  usermod -aG docker "$DEPLOY_USER"
  info "用户 $DEPLOY_USER 已创建并加入 docker 组"
else
  info "3/7 用户 $DEPLOY_USER 已存在"
  usermod -aG docker "$DEPLOY_USER"
fi

# 配置 SSH 密钥 (用于 GitHub Actions)
DEPLOY_SSH_DIR="/home/$DEPLOY_USER/.ssh"
if [ ! -f "$DEPLOY_SSH_DIR/authorized_keys" ]; then
  mkdir -p "$DEPLOY_SSH_DIR"
  touch "$DEPLOY_SSH_DIR/authorized_keys"
  chmod 700 "$DEPLOY_SSH_DIR"
  chmod 600 "$DEPLOY_SSH_DIR/authorized_keys"
  chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_SSH_DIR"
  warn "请将 GitHub Actions 的 SSH 公钥追加到: $DEPLOY_SSH_DIR/authorized_keys"
fi

# ===========================================
# 4. 创建项目目录
# ===========================================
info "4/7 创建项目目录..."
mkdir -p "$PROJECT_DIR"
mkdir -p "$SSL_DIR"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$PROJECT_DIR"

# ===========================================
# 5. 配置防火墙
# ===========================================
info "5/7 配置防火墙..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
info "防火墙已启用: SSH(22), HTTP(80), HTTPS(443)"

# ===========================================
# 6. 克隆仓库
# ===========================================
info "6/7 准备项目仓库..."
if [ -n "$GITHUB_REPO" ]; then
  if [ ! -d "$PROJECT_DIR/.git" ]; then
    su - "$DEPLOY_USER" -c "git clone $GITHUB_REPO $PROJECT_DIR"
    info "仓库已克隆到 $PROJECT_DIR"
  else
    info "仓库已存在，跳过克隆"
  fi
else
  warn "GITHUB_REPO 未设置，请手动克隆仓库到 $PROJECT_DIR"
fi

# ===========================================
# 7. 输出后续步骤
# ===========================================
info "7/7 初始化完成！"
echo ""
echo "=========================================="
echo "  后续手动操作步骤"
echo "=========================================="
echo ""
echo "1. 上传 SSL 证书:"
echo "   scp fullchain.pem root@<SERVER_IP>:$SSL_DIR/fullchain.pem"
echo "   scp privkey.pem   root@<SERVER_IP>:$SSL_DIR/privkey.pem"
echo ""
echo "2. 配置环境变量:"
echo "   cp $PROJECT_DIR/.env.prod.example $PROJECT_DIR/.env.prod"
echo "   nano $PROJECT_DIR/.env.prod  # 填入实际密码和密钥"
echo ""
echo "3. 配置 GitHub Actions SSH 密钥:"
echo "   a) 在此服务器上生成密钥对:"
echo "      su - $DEPLOY_USER -c 'ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N \"\"'"
echo "   b) 添加公钥到 authorized_keys:"
echo "      cat /home/$DEPLOY_USER/.ssh/github_deploy.pub >> /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "   c) 在 GitHub 仓库 Settings → Secrets → Actions 中添加:"
echo "      SSH_HOST       = 服务器公网 IP"
echo "      SSH_USER       = $DEPLOY_USER"
echo "      SSH_PRIVATE_KEY = /home/$DEPLOY_USER/.ssh/github_deploy 私钥内容"
echo "      SSH_PORT        = 22"
echo ""
echo "4. DNS 配置:"
echo "   将 hl.easudata.com A 记录指向此服务器 IP"
echo ""
echo "5. 首次部署 (手动):"
echo "   cd $PROJECT_DIR"
echo "   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d"
echo ""
echo "6. 导入测试数据 (可选):"
echo "   docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm seed"
echo ""
echo "=========================================="
