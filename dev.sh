#!/bin/bash
# ==========================================
# 婚恋中介管理平台 - 开发环境一键管理脚本
#
# 用法:
#   ./dev.sh              默认启动 (Docker基础设施 + 本地前后端热重载)
#   ./dev.sh docker       全部用 Docker 容器运行 (无需本地 Node.js)
#   ./dev.sh local        纯本地模式 (需本地已有 MySQL/Redis)
#   ./dev.sh stop         停止所有服务 (本地进程 + Docker 容器)
#   ./dev.sh seed         导入测试数据
#   ./dev.sh reset        重建数据库表 (清理索引等问题)
#   ./dev.sh logs         查看后端/前端日志
#   ./dev.sh status       查看所有服务状态
#   ./dev.sh db           进入 MySQL 命令行
# ==========================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"
ADMIN_DIR="$ROOT_DIR/admin"
PID_FILE="$ROOT_DIR/.dev-pids"
ENV_FILE="$ROOT_DIR/.env"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "${CYAN}[STEP]${NC}  ${BOLD}$1${NC}"; }

# ==========================================
# 工具函数
# ==========================================

# 加载 .env 中的变量
load_env() {
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    source "$ENV_FILE"
    set +a
  fi
}

# 检测 Docker 是否可用
has_docker() {
  command -v docker &>/dev/null && docker info &>/dev/null 2>&1
}

# Docker Compose 命令 (兼容 v1/v2)
docker_compose() {
  if docker compose version &>/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose &>/dev/null; then
    docker-compose "$@"
  else
    log_error "未找到 docker compose 命令"
    return 1
  fi
}

# 获取 WSL IP
get_wsl_ip() {
  ip addr show eth0 2>/dev/null | grep -oP 'inet \K[\d.]+' || hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost"
}

# 停止本地进程
stop_local_processes() {
  if [[ -f "$PID_FILE" ]]; then
    log_info "停止本地进程..."
    while IFS= read -r pid; do
      if kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null
        log_info "  已停止 PID=$pid"
      fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
  fi
}

# 停止 Docker 容器
stop_docker_services() {
  if has_docker; then
    local running
    running=$(docker_compose ps -q 2>/dev/null | wc -l)
    if [[ "$running" -gt 0 ]]; then
      log_info "停止 Docker 容器..."
      docker_compose down 2>/dev/null || true
    fi
  fi
}

# 安装 npm 依赖
install_deps() {
  local dir=$1 name=$2
  if [[ ! -d "$dir/node_modules" ]]; then
    log_info "安装 $name 依赖..."
    (cd "$dir" && npm install --silent)
    log_info "$name 依赖安装完成"
  else
    log_info "$name 依赖已存在，跳过"
  fi
}

# 等待端口可用
wait_for_port() {
  local host=$1 port=$2 name=$3 timeout=${4:-30}
  local elapsed=0
  log_info "等待 $name ($host:$port) 就绪..."
  while ! timeout 1 bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null; do
    sleep 1
    elapsed=$((elapsed + 1))
    if [[ $elapsed -ge $timeout ]]; then
      log_error "$name 在 ${timeout}s 内未就绪"
      return 1
    fi
  done
  log_info "$name 已就绪 (${elapsed}s)"
}

# 等待 MySQL 可查询
wait_for_mysql() {
  local host=$1 port=$2 user=$3 pass=$4 timeout=${5:-60}
  local elapsed=0
  log_info "等待 MySQL 可查询..."
  while ! mysql -h"$host" -P"$port" -u"$user" -p"$pass" -e "SELECT 1" &>/dev/null 2>&1; do
    sleep 2
    elapsed=$((elapsed + 2))
    if [[ $elapsed -ge $timeout ]]; then
      log_warn "MySQL 在 ${timeout}s 内未完全就绪，继续..."
      return 1
    fi
  done
  log_info "MySQL 可查询 (${elapsed}s)"
}

# 打印服务信息面板
print_banner() {
  local mode=$1
  local WSL_IP
  WSL_IP=$(get_wsl_ip)

  echo ""
  echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║      婚恋中介管理平台 - 开发环境已启动            ║${NC}"
  echo -e "${CYAN}║      模式: ${BOLD}${mode}${NC}${CYAN}$(printf '%*s' $((32 - ${#mode})) '')║${NC}"
  echo -e "${CYAN}╠═══════════════════════════════════════════════════╣${NC}"
  echo -e "${CYAN}║${NC}                                                   ${CYAN}║${NC}"

  if [[ "$mode" == "Docker全栈" ]]; then
    echo -e "${CYAN}║${NC}  前端页面:  ${GREEN}http://localhost${NC}                      ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  管理后台:  ${GREEN}http://localhost/admin/${NC}               ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  后端API:   ${GREEN}http://localhost:3000/api${NC}              ${CYAN}║${NC}"
  else
    echo -e "${CYAN}║${NC}  前端页面:  ${GREEN}http://localhost:5173${NC}                  ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  管理后台:  ${GREEN}http://localhost:5174/admin/${NC}           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  后端API:   ${GREEN}http://localhost:3000/api${NC}              ${CYAN}║${NC}"
  fi

  echo -e "${CYAN}║${NC}                                                   ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  ${YELLOW}WSL IP: ${WSL_IP}${NC}$(printf '%*s' $((35 - ${#WSL_IP})) '')${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}                                                   ${CYAN}║${NC}"
  echo -e "${CYAN}╠═══════════════════════════════════════════════════╣${NC}"
  echo -e "${CYAN}║${NC}  ${BOLD}常用命令:${NC}                                        ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  停止服务:      ${YELLOW}./dev.sh stop${NC}                     ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  导入测试数据:  ${YELLOW}./dev.sh seed${NC}                     ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  查看日志:      ${YELLOW}./dev.sh logs${NC}                     ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  服务状态:      ${YELLOW}./dev.sh status${NC}                   ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  数据库终端:    ${YELLOW}./dev.sh db${NC}                       ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  健康检查:      ${YELLOW}curl localhost:3000/api/health${NC}     ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}                                                   ${CYAN}║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
  echo ""
}

# ==========================================
# 命令: stop
# ==========================================
cmd_stop() {
  log_step "停止所有服务"
  stop_local_processes
  stop_docker_services
  log_info "所有服务已停止"
}

# ==========================================
# 命令: seed - 导入测试数据
# ==========================================
cmd_seed() {
  load_env
  log_step "导入测试数据"

  local db_host="${DB_HOST:-127.0.0.1}"

  # 如果 Docker 中运行了 MySQL 容器，通过容器执行
  if has_docker; then
    local mysql_container
    mysql_container=$(docker_compose ps -q mysql 2>/dev/null || true)
    if [[ -n "$mysql_container" ]]; then
      log_info "检测到 Docker MySQL 容器，通过容器执行..."
      docker_compose run --rm seed
      return $?
    fi
  fi

  # 否则本地执行
  log_info "使用本地 Node.js 执行..."
  if [[ "$db_host" == "mysql" ]]; then
    db_host="127.0.0.1"
  fi
  local db_port="${DOCKER_MYSQL_PORT:-${DB_PORT:-3307}}"
  cd "$SERVER_DIR"
  DB_HOST="$db_host" DB_PORT="$db_port" node src/migrations/seed_test_data.js
}

# ==========================================
# 命令: reset - 重建数据库表 (清理索引累积等问题)
# ==========================================
cmd_reset() {
  load_env
  log_step "重建数据库表"

  local db_host="${DB_HOST:-127.0.0.1}"
  if [[ "$db_host" == "mysql" ]]; then
    db_host="127.0.0.1"
  fi
  local db_port="${DOCKER_MYSQL_PORT:-${DB_PORT:-3307}}"

  log_warn "这将删除所有数据并重建表结构！"
  read -rp "确认继续? (y/N): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    log_info "已取消"
    return
  fi

  cd "$SERVER_DIR"
  log_info "重建数据库表..."
  DB_HOST="$db_host" DB_PORT="$db_port" REDIS_HOST=127.0.0.1 REDIS_PORT="${DOCKER_REDIS_PORT:-6380}" FORCE_SYNC=1 node src/server.js &
  local pid=$!
  sleep 8
  kill "$pid" 2>/dev/null
  log_info "表结构已重建"

  log_info "重新导入测试数据..."
  DB_HOST="$db_host" DB_PORT="$db_port" node src/migrations/seed_test_data.js
  log_info "数据库重置完成"
}

# ==========================================
# 命令: logs - 查看日志
# ==========================================
cmd_logs() {
  echo ""
  echo -e "${CYAN}选择要查看的日志:${NC}"
  echo "  1) 后端日志 (.server.log)"
  echo "  2) 前端日志 (.client.log)"
  echo "  3) 管理后台日志 (.admin.log)"
  echo "  4) Docker 所有容器日志"
  echo "  5) Docker MySQL 日志"
  echo ""
  read -rp "请选择 [1-5]: " choice

  case "$choice" in
    1) tail -f "$ROOT_DIR/.server.log" 2>/dev/null || log_warn "后端日志不存在" ;;
    2) tail -f "$ROOT_DIR/.client.log" 2>/dev/null || log_warn "前端日志不存在" ;;
    3) tail -f "$ROOT_DIR/.admin.log" 2>/dev/null || log_warn "管理后台日志不存在" ;;
    4) has_docker && docker_compose logs -f --tail=50 || log_warn "Docker 不可用" ;;
    5) has_docker && docker_compose logs -f --tail=50 mysql || log_warn "Docker 不可用" ;;
    *) log_warn "无效选择" ;;
  esac
}

# ==========================================
# 命令: status - 查看服务状态
# ==========================================
cmd_status() {
  echo ""
  log_step "服务状态"

  # 本地进程
  echo -e "\n${BOLD}本地进程:${NC}"
  if [[ -f "$PID_FILE" ]]; then
    while IFS= read -r pid; do
      if kill -0 "$pid" 2>/dev/null; then
        local cmd
        cmd=$(ps -p "$pid" -o args= 2>/dev/null || echo "unknown")
        echo -e "  ${GREEN}●${NC} PID=$pid  $cmd"
      else
        echo -e "  ${RED}●${NC} PID=$pid  (已退出)"
      fi
    done < "$PID_FILE"
  else
    echo -e "  ${YELLOW}无本地进程${NC}"
  fi

  # Docker 容器
  echo -e "\n${BOLD}Docker 容器:${NC}"
  if has_docker; then
    docker_compose ps 2>/dev/null || echo -e "  ${YELLOW}无 Docker 容器运行${NC}"
  else
    echo -e "  ${YELLOW}Docker 不可用${NC}"
  fi

  # 端口检查
  echo -e "\n${BOLD}端口检查:${NC}"
  for port_info in "3306:MySQL(本地)" "3307:MySQL(Docker)" "6379:Redis(本地)" "6380:Redis(Docker)" "3000:后端API" "5173:前端Dev"; do
    local port="${port_info%%:*}" name="${port_info##*:}"
    if timeout 1 bash -c "echo >/dev/tcp/127.0.0.1/$port" 2>/dev/null; then
      echo -e "  ${GREEN}●${NC} $name (:$port) 运行中"
    else
      echo -e "  ${RED}●${NC} $name (:$port) 未运行"
    fi
  done
  echo ""
}

# ==========================================
# 命令: db - 进入 MySQL 终端
# ==========================================
cmd_db() {
  load_env
  local db_host="${DB_HOST:-127.0.0.1}"
  local db_port="${DB_PORT:-3306}"
  local db_user="${DB_USER:-hl_user}"
  local db_pass="${DB_PASSWORD:-hl123456}"
  local db_name="${DB_NAME:-hl_matchmaking}"

  # 如果是 Docker 容器内的 MySQL，用 exec
  if has_docker; then
    local mysql_container
    mysql_container=$(docker_compose ps -q mysql 2>/dev/null || true)
    if [[ -n "$mysql_container" ]]; then
      log_info "通过 Docker 进入 MySQL..."
      docker exec -it "$mysql_container" mysql -u"$db_user" -p"$db_pass" "$db_name"
      return
    fi
  fi

  # 本地 MySQL
  if [[ "$db_host" == "mysql" ]]; then
    db_host="127.0.0.1"
  fi
  mysql -h"$db_host" -P"$db_port" -u"$db_user" -p"$db_pass" "$db_name"
}

# ==========================================
# 启动模式: Docker 全栈 (全部容器化)
# ==========================================
start_docker_full() {
  log_step "1/3 检查 Docker 环境"
  if ! has_docker; then
    log_error "Docker 不可用。WSL2 用户请在 Docker Desktop 中启用 WSL 集成:"
    echo -e "  ${YELLOW}Docker Desktop → Settings → Resources → WSL Integration → 启用你的发行版${NC}"
    exit 1
  fi
  log_info "Docker 可用"

  log_step "2/3 构建并启动所有容器"
  docker_compose up -d --build

  log_step "3/3 等待服务就绪"
  wait_for_port 127.0.0.1 3306 "MySQL" 60
  wait_for_port 127.0.0.1 3000 "后端API" 30

  print_banner "Docker全栈"

  log_info "所有服务运行在 Docker 中"
  log_info "查看日志: docker compose logs -f"
  log_info "停止服务: ./dev.sh stop"
}

# ==========================================
# 启动模式: 混合模式 (Docker基础设施 + 本地Node热重载)
# ==========================================
start_hybrid() {
  load_env

  # -- 检查 Node.js --
  log_step "1/6 检查 Node.js 环境"
  if ! command -v node &>/dev/null; then
    log_error "未找到 Node.js，请先安装 (>=18)"
    exit 1
  fi
  log_info "Node.js $(node -v)"

  # -- 启动 Docker 基础设施 --
  log_step "2/6 启动 Docker 基础设施 (MySQL + Redis)"
  if ! has_docker; then
    log_error "Docker 不可用。请选择以下方案之一:"
    echo -e "  ${YELLOW}1. 在 Docker Desktop 中启用 WSL 集成${NC}"
    echo -e "     Docker Desktop → Settings → Resources → WSL Integration"
    echo -e "  ${YELLOW}2. 在 WSL 中直接安装 Docker Engine${NC}"
    echo -e "     sudo apt install docker.io docker-compose-v2"
    echo -e "  ${YELLOW}3. 使用纯本地模式 (需自行安装 MySQL/Redis)${NC}"
    echo -e "     ./dev.sh local"
    exit 1
  fi

  # Docker 端口映射 (避免与本地 MySQL/Redis 冲突)
  local docker_mysql_port="${DOCKER_MYSQL_PORT:-3307}"
  local docker_redis_port="${DOCKER_REDIS_PORT:-6380}"

  # 只启动 mysql 和 redis (不启动 client/server/seed)
  DOCKER_MYSQL_PORT="$docker_mysql_port" DOCKER_REDIS_PORT="$docker_redis_port" docker_compose up -d mysql redis
  wait_for_port 127.0.0.1 "$docker_mysql_port" "MySQL" 60
  wait_for_port 127.0.0.1 "$docker_redis_port" "Redis" 15

  # 等待 MySQL 初始化完成 (第一次启动时需要建表)
  if command -v mysql &>/dev/null; then
    wait_for_mysql "127.0.0.1" "$docker_mysql_port" "${DB_USER:-hl_user}" "${DB_PASSWORD:-hl123456}" 60
  else
    log_info "等待 MySQL 初始化..."
    sleep 5
  fi

  # -- 安装依赖 --
  log_step "3/7 安装项目依赖"
  install_deps "$SERVER_DIR" "后端"
  install_deps "$CLIENT_DIR" "前端"
  install_deps "$ADMIN_DIR" "管理后台"

  # -- 停止残留进程 --
  stop_local_processes 2>/dev/null
  rm -f "$PID_FILE"

  # 清理占用端口 3000/5173/5174 的残留进程 (手动启动或 Playwright 遗留)
  for port in 3000 5173 5174; do
    local stale_pid
    stale_pid=$(lsof -ti :"$port" 2>/dev/null || true)
    if [[ -n "$stale_pid" ]]; then
      log_warn "端口 $port 被 PID=$stale_pid 占用，正在清理..."
      kill "$stale_pid" 2>/dev/null || true
      sleep 1
      kill -9 "$stale_pid" 2>/dev/null || true
    fi
  done

  # -- 启动后端 --
  log_step "4/7 启动后端 (端口 3000, 热重载)"
  cd "$SERVER_DIR"
  DB_HOST=127.0.0.1 DB_PORT="$docker_mysql_port" REDIS_HOST=127.0.0.1 REDIS_PORT="$docker_redis_port" node --watch src/server.js > "$ROOT_DIR/.server.log" 2>&1 &
  local server_pid=$!
  echo "$server_pid" >> "$PID_FILE"
  log_info "后端 PID=$server_pid"

  # 等待后端实际就绪 (DB sync 可能需要 10+ 秒)
  wait_for_port 127.0.0.1 3000 "后端API" 30
  if ! kill -0 "$server_pid" 2>/dev/null; then
    log_error "后端启动失败! 日志内容:"
    tail -30 "$ROOT_DIR/.server.log"
    exit 1
  fi

  # -- 启动前端 --
  log_step "5/7 启动前端 (端口 5173, HMR)"
  cd "$CLIENT_DIR"
  npx vite --host 0.0.0.0 > "$ROOT_DIR/.client.log" 2>&1 &
  local client_pid=$!
  echo "$client_pid" >> "$PID_FILE"
  log_info "前端 PID=$client_pid"

  wait_for_port 127.0.0.1 5173 "前端页面" 15

  # -- 启动管理后台 --
  log_step "6/7 启动管理后台 (端口 5174, HMR)"
  install_deps "$ADMIN_DIR" "管理后台"
  cd "$ADMIN_DIR"
  npx vite --host 0.0.0.0 > "$ROOT_DIR/.admin.log" 2>&1 &
  local admin_pid=$!
  echo "$admin_pid" >> "$PID_FILE"
  log_info "管理后台 PID=$admin_pid"

  wait_for_port 127.0.0.1 5174 "管理后台" 15

  # -- 完成 --
  log_step "7/7 启动完成"
  print_banner "混合模式 (Docker+本地)"

  # 前台等待，Ctrl+C 优雅退出
  trap 'echo ""; cmd_stop; exit 0' INT TERM
  log_info "按 Ctrl+C 停止所有服务"
  wait
}

# ==========================================
# 启动模式: 纯本地 (需本地 MySQL + Redis)
# ==========================================
start_local() {
  load_env

  # -- 检查 Node.js --
  log_step "1/5 检查 Node.js 环境"
  if ! command -v node &>/dev/null; then
    log_error "未找到 Node.js，请先安装 (>=18)"
    exit 1
  fi
  log_info "Node.js $(node -v)"

  # -- 检查 MySQL --
  log_step "2/5 检查 MySQL 连接"
  local db_host="${DB_HOST:-127.0.0.1}"
  local db_port="${DB_PORT:-3306}"
  local db_user="${DB_USER:-hl_user}"
  local db_pass="${DB_PASSWORD:-hl123456}"
  local db_name="${DB_NAME:-hl_matchmaking}"

  if [[ "$db_host" == "mysql" ]]; then
    db_host="127.0.0.1"
  fi

  if command -v mysql &>/dev/null; then
    if mysql -h"$db_host" -P"$db_port" -u"$db_user" -p"$db_pass" -e "SELECT 1" &>/dev/null 2>&1; then
      log_info "MySQL 连接正常 ($db_host:$db_port)"
      mysql -h"$db_host" -P"$db_port" -u"$db_user" -p"$db_pass" \
        -e "CREATE DATABASE IF NOT EXISTS \`$db_name\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    else
      log_warn "MySQL 无法连接 ($db_host:$db_port)，后端可能启动失败"
    fi
  else
    log_warn "未安装 mysql 客户端，跳过检查"
  fi

  # -- 安装依赖 --
  log_step "3/7 安装项目依赖"
  install_deps "$SERVER_DIR" "后端"
  install_deps "$CLIENT_DIR" "前端"
  install_deps "$ADMIN_DIR" "管理后台"

  # -- 停止残留进程 --
  stop_local_processes 2>/dev/null
  rm -f "$PID_FILE"

  # 清理占用端口 3000/5173/5174 的残留进程
  for port in 3000 5173 5174; do
    local stale_pid
    stale_pid=$(lsof -ti :"$port" 2>/dev/null || true)
    if [[ -n "$stale_pid" ]]; then
      log_warn "端口 $port 被 PID=$stale_pid 占用，正在清理..."
      kill "$stale_pid" 2>/dev/null || true
      sleep 1
      kill -9 "$stale_pid" 2>/dev/null || true
    fi
  done

  # -- 启动后端 --
  log_step "4/7 启动后端 (端口 3000)"
  cd "$SERVER_DIR"
  DB_HOST="$db_host" REDIS_HOST="${REDIS_HOST:-127.0.0.1}" node --watch src/server.js > "$ROOT_DIR/.server.log" 2>&1 &
  local server_pid=$!
  echo "$server_pid" >> "$PID_FILE"
  log_info "后端 PID=$server_pid"

  wait_for_port 127.0.0.1 3000 "后端API" 30
  if ! kill -0 "$server_pid" 2>/dev/null; then
    log_error "后端启动失败! 日志内容:"
    tail -30 "$ROOT_DIR/.server.log"
    exit 1
  fi

  # -- 启动前端 --
  log_step "5/7 启动前端 (端口 5173)"
  cd "$CLIENT_DIR"
  npx vite --host 0.0.0.0 > "$ROOT_DIR/.client.log" 2>&1 &
  local client_pid=$!
  echo "$client_pid" >> "$PID_FILE"
  log_info "前端 PID=$client_pid"

  wait_for_port 127.0.0.1 5173 "前端页面" 15

  # -- 启动管理后台 --
  log_step "6/7 启动管理后台 (端口 5174)"
  cd "$ADMIN_DIR"
  npx vite --host 0.0.0.0 > "$ROOT_DIR/.admin.log" 2>&1 &
  local admin_pid=$!
  echo "$admin_pid" >> "$PID_FILE"
  log_info "管理后台 PID=$admin_pid"

  wait_for_port 127.0.0.1 5174 "管理后台" 15

  # -- 完成 --
  log_step "7/7 启动完成"
  print_banner "本地模式"

  trap 'echo ""; cmd_stop; exit 0' INT TERM
  log_info "按 Ctrl+C 停止所有服务"
  wait
}

# ==========================================
# 主入口
# ==========================================
cd "$ROOT_DIR"

case "${1:-}" in
  stop)
    cmd_stop
    ;;
  seed)
    cmd_seed
    ;;
  reset)
    cmd_reset
    ;;
  logs)
    cmd_logs
    ;;
  status)
    cmd_status
    ;;
  db)
    cmd_db
    ;;
  docker)
    cmd_stop 2>/dev/null
    start_docker_full
    ;;
  local)
    cmd_stop 2>/dev/null
    start_local
    ;;
  help|-h|--help)
    echo ""
    echo -e "${BOLD}婚恋中介管理平台 - 开发环境管理脚本${NC}"
    echo ""
    echo -e "${BOLD}用法:${NC} ./dev.sh [命令]"
    echo ""
    echo -e "${BOLD}启动模式:${NC}"
    echo "  (默认)     混合模式: Docker 运行 MySQL+Redis, 本地运行前后端 (推荐)"
    echo "  docker     Docker 全栈: 所有服务都在 Docker 中运行"
    echo "  local      纯本地模式: 需要本地已安装 MySQL 和 Redis"
    echo ""
    echo -e "${BOLD}管理命令:${NC}"
    echo "  stop       停止所有服务 (本地进程 + Docker 容器)"
    echo "  seed       导入测试数据 (22个用户, 匹配记录, 消息等)"
    echo "  reset      重建数据库表并重新导入测试数据"
    echo "  logs       交互式查看日志"
    echo "  status     查看所有服务运行状态"
    echo "  db         进入 MySQL 命令行终端"
    echo "  help       显示此帮助信息"
    echo ""
    echo -e "${BOLD}测试账号 (需先 ./dev.sh seed):${NC}"
    echo "  密码统一: test123456"
    echo "  男用户: 13800000001 ~ 13800000010"
    echo "  女用户: 13900000001 ~ 13900000010"
    echo "  红  娘: 13700000001, 13700000002"
    echo ""
    ;;
  "")
    # 默认: 混合模式
    cmd_stop 2>/dev/null
    start_hybrid
    ;;
  *)
    log_error "未知命令: $1"
    echo "运行 ./dev.sh help 查看帮助"
    exit 1
    ;;
esac
