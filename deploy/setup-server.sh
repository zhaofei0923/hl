#!/bin/bash
# ==========================================
# 婚恋平台 - 腾讯云 CVM 初始化脚本
# 适用于已有 nginx + Docker 的服务器（与其他项目共存）
# 以 root 用户运行: sudo bash deploy/setup-server.sh
# ==========================================

set -e

# ---------- 配置项 ----------
PROJECT_DIR="/opt/hl"
DEPLOY_USER="ubuntu"  # 使用服务器现有用户
SSL_DIR="/etc/nginx/ssl/hl.easudata.com"
GITHUB_REPO="https://github.com/zhaofei0923/hl.git"

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
echo "  婚恋平台 - 服务器初始化（共存模式）"
echo "=========================================="
echo ""

# ===========================================
# 1. 检查 Docker 和 Nginx
# ===========================================
info "1/6 检查 Docker..."
if ! command -v docker &>/dev/null; then
  error "Docker 未安装，请先安装 Docker"
fi
info "Docker: $(docker --version)"

if ! command -v nginx &>/dev/null; then
  error "Nginx 未安装"
fi
info "Nginx: $(nginx -v 2>&1)"

# 确保部署用户在 docker 组
usermod -aG docker "$DEPLOY_USER" 2>/dev/null || true

# ===========================================
# 2. 创建项目目录
# ===========================================
info "2/6 创建项目目录..."
mkdir -p "$PROJECT_DIR"
mkdir -p "$SSL_DIR"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$PROJECT_DIR"

# ===========================================
# 3. 克隆仓库
# ===========================================
info "3/6 克隆代码仓库..."
if [ ! -d "$PROJECT_DIR/.git" ]; then
  su - "$DEPLOY_USER" -c "git clone $GITHUB_REPO $PROJECT_DIR"
  info "仓库已克隆到 $PROJECT_DIR"
else
  info "仓库已存在，拉取最新代码..."
  su - "$DEPLOY_USER" -c "cd $PROJECT_DIR && git pull origin main"
fi

# ===========================================
# 4. 配置 Nginx 站点
# ===========================================
info "4/6 配置 Nginx 站点..."
cp "$PROJECT_DIR/deploy/nginx-hl.conf" /etc/nginx/sites-available/hl

if [ ! -L /etc/nginx/sites-enabled/hl ]; then
  ln -s /etc/nginx/sites-available/hl /etc/nginx/sites-enabled/hl
  info "已启用 hl.easudata.com 站点"
else
  info "站点已启用"
fi

# 检查 SSL 证书是否存在
if [ ! -f "$SSL_DIR/fullchain.pem" ] || [ ! -f "$SSL_DIR/privkey.pem" ]; then
  warn "SSL 证书未找到！请先上传证书后再重启 nginx："
  warn "  $SSL_DIR/fullchain.pem"
  warn "  $SSL_DIR/privkey.pem"
  warn "暂不重载 nginx，等证书就绪后运行: sudo nginx -t && sudo systemctl reload nginx"
else
  nginx -t && systemctl reload nginx
  info "Nginx 配置已重载"
fi

# ===========================================
# 5. 配置 GitHub Actions SSH 密钥
# ===========================================
info "5/6 配置 SSH 密钥..."
DEPLOY_SSH_DIR="/home/$DEPLOY_USER/.ssh"
mkdir -p "$DEPLOY_SSH_DIR"

if [ ! -f "$DEPLOY_SSH_DIR/github_deploy" ]; then
  su - "$DEPLOY_USER" -c "ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N '' -q"
  cat "$DEPLOY_SSH_DIR/github_deploy.pub" >> "$DEPLOY_SSH_DIR/authorized_keys"
  chmod 600 "$DEPLOY_SSH_DIR/authorized_keys"
  info "SSH 密钥已生成"
else
  info "SSH 密钥已存在"
fi

# ===========================================
# 6. 输出后续步骤
# ===========================================
info "6/6 初始化完成！"
echo ""
echo "=========================================="
echo "  后续手动操作步骤"
echo "=========================================="
echo ""
echo "1. 上传 SSL 证书（腾讯云下载 Nginx 格式）:"
echo "   scp your_domain.pem  root@152.136.160.173:$SSL_DIR/fullchain.pem"
echo "   scp your_domain.key  root@152.136.160.173:$SSL_DIR/privkey.pem"
echo "   然后运行: sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "2. 配置 .env.prod:"
echo "   cd $PROJECT_DIR"
echo "   cp .env.prod.example .env.prod"
echo "   nano .env.prod  # 修改密码和密钥 (openssl rand -hex 32 生成)"
echo ""
echo "3. 首次启动:"
echo "   cd $PROJECT_DIR"
echo "   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d"
echo ""
echo "4. 配置 GitHub Actions Secrets (https://github.com/zhaofei0923/hl/settings/secrets/actions):"
echo "   SSH_HOST       = 152.136.160.173"
echo "   SSH_USER       = $DEPLOY_USER"
echo "   SSH_PORT        = 22"
echo "   SSH_PRIVATE_KEY = 以下内容:"
echo "   ---"
cat "$DEPLOY_SSH_DIR/github_deploy"
echo "   ---"
echo ""
echo "5. DNS: hl.easudata.com A 记录 → 152.136.160.173"
echo ""
echo "6. 导入测试数据（可选）:"
echo "   docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm seed"
echo ""
echo "=========================================="
