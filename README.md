# GLM Plan Usage Dashboard

GLM Coding Plan 用量监控面板，支持 ZAI 和智谱两个平台。

## 功能

- 模型用量统计（堆叠柱状图）
- MCP 工具使用监控
- 配额限制与使用进度展示
- 时间范围选择（1h / 6h / 12h / 24h / 7d / 30d）
- 多主题切换（Midnight / Light / Nord / Dracula / Warm Sand）
- 自动刷新

## 快速开始

### 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `ANTHROPIC_BASE_URL` | API 基础地址 | `https://api.z.ai/api/anthropic` |
| `ANTHROPIC_AUTH_TOKEN` | 认证 Token | `your-token-here` |

平台地址参考：

- ZAI：`https://api.z.ai/api/anthropic`
- 智谱：`https://open.bigmodel.cn/api/anthropic`

### 方式一：使用启动脚本

编辑 `start.sh`，填入你的 Token，然后运行：

```bash
./start.sh          # 默认端口 3000
./start.sh 8080     # 指定端口
```

### 方式二：手动启动

```bash
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_AUTH_TOKEN="your-token-here"
node server.mjs        # 默认端口 3000
node server.mjs 8080   # 指定端口
```

启动后访问 `http://localhost:3000` 即可。

## 技术栈

- 纯 Node.js，零依赖
- 单 HTML 文件前端，内嵌 CSS 和 JavaScript
