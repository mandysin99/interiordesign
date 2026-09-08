#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8765}"
MODE="${2:-full}"

if [[ "$MODE" != "full" && "$MODE" != "neighbor" ]]; then
  echo "MODE must be full or neighbor" >&2
  exit 1
fi

cd "$(dirname "$0")"

if command -v python3 >/dev/null 2>&1; then
  :
else
  echo "未找到 python3，请先安装 Python。" >&2
  exit 1
fi

echo "启动本地服务：监听 0.0.0.0:$PORT"
echo "完整版地址：http://127.0.0.1:$PORT/"
echo "邻居版地址：http://127.0.0.1:$PORT/neighbor.html"
python3 -m http.server "$PORT" --bind 0.0.0.0 >/tmp/白模项目-共享.log 2>&1 &
SERVER_PID=$!

cleanup(){
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "公网映射提示：在另一个终端运行 'npx -y localtunnel --port $PORT'，即可得到可外网访问链接。"

wait "$SERVER_PID"
