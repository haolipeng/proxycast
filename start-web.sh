#!/bin/bash
# ProxyCast 网页版启动脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}ProxyCast Web Server${NC}"
echo "================================"

# 检查是否已编译
if [ ! -f "target/release/proxycast-server" ] && [ ! -f "target/debug/proxycast-server" ]; then
    echo -e "${YELLOW}正在编译服务器...${NC}"
    cargo build -p proxycast-server --release
fi

# 使用 release 版本（如果存在）
if [ -f "target/release/proxycast-server" ]; then
    SERVER_BIN="target/release/proxycast-server"
else
    SERVER_BIN="target/debug/proxycast-server"
fi

# 检查前端是否已构建
if [ ! -d "web/dist" ]; then
    echo -e "${YELLOW}正在构建前端...${NC}"
    cd web
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run build
    cd ..
fi

# 启动服务器
echo -e "${GREEN}启动服务器...${NC}"
echo ""
exec "$SERVER_BIN" --static-dir web/dist "$@"
