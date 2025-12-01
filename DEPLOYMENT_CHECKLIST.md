# Stream Chat 部署清单

## 完成情况

✅ 1. 为 chatbot extension 添加 stream-chat 和 stream-chat-react 依赖
✅ 2. 更新 Dockerfile 以安装 Stream Chat 依赖
✅ 3. 创建 Stream Chat 配置和集成组件
✅ 4. 配置连接到 chatbot-node 的 Coze API 代理
✅ 5. 更新 widget 使用 Stream Chat UI
🔄 6. 部署到 fly.io

## 已完成的工作

### 1. 依赖管理
- ✅ 在 `extensions/chatbot/package.json` 添加了：
  - `stream-chat: ^8.40.0`
  - `stream-chat-react: ^11.22.0`

### 2. Docker 配置
- ✅ 更新了 `Dockerfile`:
  - 添加全局安装 stream-chat 和 stream-chat-react
  - 添加 chatbot extension 依赖安装步骤

### 3. Stream Chat 服务
- ✅ 创建了 `StreamChatService.ts`:
  - 初始化 Stream Chat 客户端
  - 用户管理（创建/更新用户）
  - Token 生成
  - Channel 管理
  - 消息发送（集成 chatbot-node）

### 4. React 组件
- ✅ 创建了 `StreamChatWidget.tsx`:
  - 使用 Stream Chat React 组件
  - 聊天按钮和窗口
  - 未读消息计数
  - 响应式设计
  - 深色模式支持

### 5. API 路由
- ✅ `/api/chatbot/stream-chat-token` - 生成用户 token
- ✅ `/api/chatbot/stream-message` - 发送消息

### 6. 前端集成
- ✅ `StreamChatWidgetLoader.jsx` - 自动加载在所有页面
- ✅ 获取用户信息（EverShop session）
- ✅ 自动初始化聊天

### 7. Bootstrap 初始化
- ✅ 更新 `bootstrap.ts`:
  - 初始化 Stream Chat Service
  - 创建 chatbot assistant 用户
  - 环境变量验证

### 8. chatbot-node 配置
- ✅ 已配置使用 `https://api.coze.cn`
- ✅ JWT OAuth 认证
- ✅ SSE 流式响应
- ✅ 多租户支持

## 部署前准备

### 必需的环境变量

在 Fly.io 设置以下 secrets：

```bash
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

### Stream Chat 配置

1. 访问 https://dashboard.getstream.io/
2. 创建新应用或使用现有应用
3. 获取 API Key 和 Secret
4. 记录这些凭据用于上面的环境变量设置

### chatbot-node 确认

确认 chatbot-node 已正确配置：

```bash
# 检查状态
fly status --app chatbot-node

# 检查日志
fly logs --app chatbot-node

# 测试健康检查
curl https://chatbot-node.fly.dev/health

# 验证 Coze API 配置
fly ssh console --app chatbot-node
env | grep COZE
```

## 部署步骤

### 1. 设置环境变量

```bash
# 如果还没有设置，运行上面的 fly secrets set 命令
# 验证 secrets
fly secrets list --app evershop-fly
```

### 2. 构建和部署

```bash
# 方式 1: 使用部署脚本（推荐）
./deploy-stream-chat.sh

# 方式 2: 手动部署
fly deploy --app evershop-fly --strategy rolling
```

### 3. 监控部署

```bash
# 查看实时日志
fly logs --app evershop-fly -f

# 检查状态
fly status --app evershop-fly

# 查看健康检查
fly checks list --app evershop-fly
```

## 部署后验证

### 1. 前端测试

```bash
# 打开商店
open https://evershop-fly.fly.dev

# 应该看到：
# - 右下角有红色聊天按钮
# - 点击按钮打开 Stream Chat 窗口
# - 可以发送消息
# - 收到 AI 回复
```

### 2. API 测试

```bash
# 测试 token 生成
curl -X POST https://evershop-fly.fly.dev/api/chatbot/stream-chat-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "userName": "Test User",
    "userRole": "visitor"
  }'

# 预期响应包含 token 和 apiKey
```

### 3. 日志检查

查看是否有以下成功日志：

```
✓ Chatbot extension with Stream Chat loaded
✓ Initializing Stream Chat service...
✓ Stream Chat service initialized successfully
✓ Chatbot enabled for shop: evershop-fly
```

## 故障排查

### 问题：聊天按钮不显示

```bash
# 检查环境变量
fly ssh console --app evershop-fly
env | grep CHATBOT
env | grep STREAM

# 检查浏览器控制台错误
# 打开浏览器开发者工具 -> Console
```

### 问题：无法连接到 chatbot-node

```bash
# 测试 chatbot-node
curl https://chatbot-node.fly.dev/health

# 检查 CORS 配置
fly logs --app chatbot-node | grep CORS
```

### 问题：Stream Chat 错误

- 验证 API Key 和 Secret 正确
- 检查 Stream Dashboard 配额
- 查看 Stream Chat 服务状态

### 问题：Coze API 错误

```bash
# 检查 chatbot-node 的 Coze 配置
fly ssh console --app chatbot-node
cat config/coze-private-key.pem
env | grep COZE

# 测试 Coze API 连通性
curl https://api.coze.cn
```

## 回滚方案

如果部署出现问题：

```bash
# 方式 1: 回滚到上一个版本
fly releases --app evershop-fly
fly releases rollback <version> --app evershop-fly

# 方式 2: 禁用 chatbot
fly secrets set CHATBOT_ENABLED="false" --app evershop-fly
```

## 相关文档

- [Stream Chat 设置指南](./extensions/chatbot/STREAM_CHAT_SETUP.md)
- [chatbot-node 部署报告](../chatbot-node/FINAL_DEPLOYMENT_REPORT.md)
- [Fly.io 文档](https://fly.io/docs/)
- [Stream Chat 文档](https://getstream.io/chat/docs/)

## 支持联系

- Fly.io: https://fly.io/docs/about/support/
- Stream: https://getstream.io/chat/support/
- Coze: https://www.coze.cn/docs


