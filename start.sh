#!/bin/bash

# GLM Plan Usage Dashboard 启动脚本
# 使用前请修改下方环境变量

# === 环境变量配置 ===
# API 基础地址（ZAI 平台 或 智谱平台，二选一）
# ZAI:    https://api.z.ai/api/anthropic
# 智谱:   https://open.bigmodel.cn/api/anthropic
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"

# 认证 Token（替换为你自己的 Token）
export ANTHROPIC_AUTH_TOKEN="your-token"

# === 端口配置 ===
PORT="${1:-3000}"

echo "Starting GLM Plan Usage Dashboard..."
echo "  Base URL: $ANTHROPIC_BASE_URL"
echo "  Port:     $PORT"
echo ""

node "$(dirname "$0")/server.mjs" "$PORT"
