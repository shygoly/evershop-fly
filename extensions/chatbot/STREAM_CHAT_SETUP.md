# Stream Chat Integration Setup Guide

本指南说明如何配置 EverShop 的 Stream Chat 集成，连接到 chatbot-node 的 Coze API 代理。

## 架构概述

```
EverShop (evershop-fly)
  └── Chatbot Extension (Stream Chat UI)
        └── chatbot-node Backend
              └── Claudeflare Proxy → api.coze.cn
```

## 前提条件

1. **Stream Chat 账号**
   - 访问 https://getstream.io/ 注册账号
   - 创建一个新的 App
   - 获取 API Key 和 API Secret

2. **chatbot-node 部署**
   - chatbot-node 应已部署到 fly.io
   - URL: `https://chatbot-node.fly.dev`
   - 配置了 Coze API (api.coze.cn) 代理

3. **Fly.io 账号**
   - 安装 Fly CLI: `brew install flyctl`
   - 登录: `fly auth login`

## 配置步骤

### 1. 配置 chatbot-node 环境变量

确保 chatbot-node 已正确配置 Coze API：

```bash
# 进入 chatbot-node 目录
cd /Users/mac/Sync/project/ecommerce/chatbot-node

# 设置 Coze API 配置（使用 Claudeflare 代理）
fly secrets set \
  COZE_BASE_URL="https://api.coze.cn" \
  COZE_CLIENT_ID="1133483935040" \
  COZE_PUBLIC_KEY="your-public-key" \
  COZE_PRIVATE_KEY_PATH="config/coze-private-key.pem" \
  COZE_WORKFLOW_ID="7530904201956147251" \
  COZE_MODEL_ID="1742989917" \
  --app chatbot-node
```

### 2. 配置 evershop-fly 环境变量

设置 EverShop 连接 chatbot-node 和 Stream Chat：

```bash
# 进入 evershop-fly 目录
cd /Users/mac/Sync/project/ecommerce/evershop-fly

# 设置环境变量
fly secrets set \
  CHATBOT_ENABLED="true" \
  CHATBOT_NODE_URL="https://chatbot-node.fly.dev" \
  CHATBOT_SHOP_ID="evershop-fly" \
  CHATBOT_SSO_SECRET="your-shared-secret-here" \
  CHATBOT_WEBHOOK_SECRET="your-webhook-secret-here" \
  STREAM_CHAT_ENABLED="true" \
  STREAM_CHAT_API_KEY="your-stream-api-key" \
  STREAM_CHAT_API_SECRET="your-stream-api-secret" \
  --app evershop-fly
```

**重要说明：**
- `CHATBOT_SSO_SECRET`: 与 chatbot-node 共享的密钥，用于 JWT 认证
- `CHATBOT_WEBHOOK_SECRET`: Webhook 签名验证密钥
- `STREAM_CHAT_API_KEY`: 从 Stream 控制台获取
- `STREAM_CHAT_API_SECRET`: 从 Stream 控制台获取（保密）

### 3. 获取 Stream Chat 凭据

1. 登录 Stream Dashboard: https://dashboard.getstream.io/
2. 选择或创建一个 App
3. 在 "App Settings" 中找到：
   - **Key**: 这是你的 `STREAM_CHAT_API_KEY`
   - **Secret**: 这是你的 `STREAM_CHAT_API_SECRET`

### 4. 验证 chatbot-node 配置

检查 chatbot-node 的配置文件：

```typescript
// /Users/mac/Sync/project/ecommerce/chatbot-node/src/config/index.ts
export default {
  coze: {
    oauth: {
      clientId: process.env.COZE_CLIENT_ID || '1133483935040',
      publicKey: process.env.COZE_PUBLIC_KEY || '_VzHkKSlwVT2yfAcNrZraFCpusQjQ7pXpEagzYheN7s',
      privateKeyPath: process.env.COZE_PRIVATE_KEY_PATH || 'config/coze-private-key.pem',
      baseUrl: process.env.COZE_BASE_URL || 'https://api.coze.cn', // ← 使用 api.coze.cn
    },
    workflowId: process.env.COZE_WORKFLOW_ID || '7530904201956147251',
    modelId: process.env.COZE_MODEL_ID || '1742989917',
  }
}
```

### 5. 部署到 Fly.io

```bash
# 在 evershop-fly 目录
cd /Users/mac/Sync/project/ecommerce/evershop-fly

# 构建和部署
fly deploy --app evershop-fly

# 查看日志
fly logs --app evershop-fly
```

### 6. 测试集成

部署完成后，访问你的 EverShop 商店：

```bash
# 打开商店
open https://evershop-fly.fly.dev

# 查看实时日志
fly logs --app evershop-fly -f
```

在页面右下角应该看到红色的聊天按钮。点击后会打开 Stream Chat widget。

## 配置验证清单

- [ ] chatbot-node 已部署并运行
- [ ] chatbot-node 配置了 Coze API (api.coze.cn)
- [ ] chatbot-node 环境变量已设置
- [ ] Stream Chat 账号已创建
- [ ] Stream Chat API Key 和 Secret 已获取
- [ ] evershop-fly 环境变量已设置
- [ ] evershop-fly 已重新部署
- [ ] 聊天按钮在前端显示
- [ ] 可以发送消息并收到 AI 回复

## 测试 API 连接

### 测试 chatbot-node

```bash
# 健康检查
curl https://chatbot-node.fly.dev/health

# 测试聊天 API（需要 JWT token）
curl -X POST https://chatbot-node.fly.dev/api/coze/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "shopId": "evershop-fly",
    "message": "Hello",
    "userId": "test-user"
  }'
```

### 测试 Stream Chat Token 生成

```bash
# 生成 Stream Chat token
curl -X POST https://evershop-fly.fly.dev/api/chatbot/stream-chat-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "userName": "Test User",
    "userRole": "visitor"
  }'
```

预期响应：
```json
{
  "token": "eyJ...",
  "userId": "test-user-123",
  "apiKey": "your-stream-api-key"
}
```

## 故障排查

### 1. 聊天按钮不显示

检查浏览器控制台错误：
```javascript
// 打开浏览器开发者工具
// Console 标签查看错误信息
```

检查环境变量：
```bash
fly ssh console --app evershop-fly
env | grep CHATBOT
env | grep STREAM
```

### 2. 无法连接到 chatbot-node

```bash
# 检查 chatbot-node 状态
fly status --app chatbot-node

# 查看 chatbot-node 日志
fly logs --app chatbot-node

# 测试连接
curl https://chatbot-node.fly.dev/health
```

### 3. Coze API 错误

检查 chatbot-node 的 Coze 配置：

```bash
fly ssh console --app chatbot-node
cd /app
cat config/coze-private-key.pem  # 确保私钥存在
env | grep COZE  # 检查 Coze 环境变量
```

### 4. Stream Chat 错误

- 验证 API Key 和 Secret 正确
- 检查 Stream Dashboard 中的 App 状态
- 确认 Stream Chat 服务可用

### 5. 查看详细日志

```bash
# EverShop 日志
fly logs --app evershop-fly -f

# chatbot-node 日志
fly logs --app chatbot-node -f

# SSH 进入容器查看
fly ssh console --app evershop-fly
```

## 消息流程

1. **用户发送消息**
   ```
   User → Stream Chat Widget → EverShop API (/api/chatbot/stream-message)
   ```

2. **EverShop 转发到 chatbot-node**
   ```
   EverShop → chatbot-node (/api/coze/chat) [JWT 认证]
   ```

3. **chatbot-node 调用 Coze API**
   ```
   chatbot-node → Claudeflare Proxy → api.coze.cn
   ```

4. **AI 响应返回**
   ```
   api.coze.cn → chatbot-node (SSE Stream) → Stream Chat → User
   ```

## 配置文件位置

- **EverShop Extension Config**: `/Users/mac/Sync/project/ecommerce/evershop-fly/extensions/chatbot/config.json`
- **chatbot-node Config**: `/Users/mac/Sync/project/ecommerce/chatbot-node/src/config/index.ts`
- **Fly.io Config**: 
  - `evershop-fly/fly.toml`
  - `chatbot-node/fly.toml`

## 安全注意事项

1. **保护敏感信息**
   - 不要将 API Secret、私钥提交到 Git
   - 使用 `fly secrets` 管理敏感环境变量
   - 定期轮换密钥

2. **CORS 配置**
   - 确保 chatbot-node 的 CORS 允许 evershop-fly 域名
   - 在生产环境使用严格的 CORS 策略

3. **速率限制**
   - Stream Chat 有使用限制
   - Coze API 有调用限制
   - 考虑实现客户端速率限制

## 更多资源

- Stream Chat 文档: https://getstream.io/chat/docs/
- Stream Chat React 文档: https://getstream.io/chat/docs/sdk/react/
- Coze API 文档: https://www.coze.cn/docs
- Fly.io 文档: https://fly.io/docs/

## 支持

如有问题，请检查：
1. Fly.io 日志
2. 浏览器控制台
3. Stream Dashboard
4. chatbot-node 日志

或联系技术支持。


