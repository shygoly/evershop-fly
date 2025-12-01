# EverShop Stream Chat 集成 - 快速参考

## ✅ 部署状态

- **应用**: evershop-fly
- **URL**: https://evershop-fly.fly.dev
- **状态**: ✅ 运行正常
- **最新部署**: 2025-11-01 15:05 UTC

## 🎯 已完成的工作

### 1. Stream Chat 集成
- ✅ 安装 `stream-chat@8.40.0` 和 `stream-chat-react@11.22.0`
- ✅ 创建 `StreamChatService` - 后端服务
- ✅ 创建 `StreamChatWidget` - React UI 组件
- ✅ API 路由: token 生成和消息发送
- ✅ 自动加载在所有前端页面

### 2. chatbot-node 集成
- ✅ 连接到 chatbot-node (https://chatbot-node.fly.dev)
- ✅ 使用 Coze API (api.coze.cn)
- ✅ JWT 认证和 SSE 流式响应
- ✅ 多租户支持

### 3. Dockerfile 优化
- ✅ 使用 `--legacy-peer-deps` 解决 React 版本冲突
- ✅ 全局和本地依赖安装
- ✅ 构建时间: ~5 分钟
- ✅ 镜像大小: 265 MB

## 🚀 启用 Stream Chat (可选)

Stream Chat 是可选功能。要启用，请：

### 步骤 1: 获取凭据
访问 https://dashboard.getstream.io/ 获取 API Key 和 Secret

### 步骤 2: 设置环境变量
```bash
fly secrets set \
  STREAM_CHAT_ENABLED="true" \
  STREAM_CHAT_API_KEY="your-key" \
  STREAM_CHAT_API_SECRET="your-secret" \
  --app evershop-fly
```

应用会自动重启并启用 Stream Chat UI。

## 📁 重要文件

```
evershop-fly/
├── extensions/chatbot/
│   ├── STREAM_CHAT_SETUP.md          # 完整设置指南
│   ├── config.json                    # 配置文件
│   ├── src/services/StreamChatService.ts
│   ├── src/components/StreamChatWidget/
│   └── src/api/getStreamChatToken/
├── Dockerfile                          # 更新的构建配置
├── DEPLOYMENT_SUCCESS_STREAM_CHAT.md  # 详细部署报告
├── DEPLOYMENT_CHECKLIST.md            # 部署清单
└── QUICK_DEPLOY.md                    # 快速部署指南
```

## 🔧 常用命令

```bash
# 查看状态
fly status --app evershop-fly

# 查看日志
fly logs --app evershop-fly

# 重启应用
fly apps restart evershop-fly

# SSH 连接
fly ssh console --app evershop-fly

# 查看环境变量
fly secrets list --app evershop-fly
```

## 📊 技术栈

- **前端**: React 18.3.1, Stream Chat React 11.22.0
- **后端**: Node.js 18+, Stream Chat SDK 8.40.0
- **数据库**: PostgreSQL
- **存储**: Cloudflare R2
- **部署**: Fly.io (Singapore)
- **AI**: Coze API (api.coze.cn)

## 🎨 消息流程

```
User
  ↓
Stream Chat Widget (React)
  ↓
EverShop API (/api/chatbot/stream-chat-token)
  ↓
chatbot-node (/api/coze/chat) [JWT 认证]
  ↓
Coze API (api.coze.cn)
  ↓
AI 响应 (SSE Stream)
  ↓
Stream Chat
  ↓
User
```

## 📚 完整文档

- [Stream Chat 设置指南](extensions/chatbot/STREAM_CHAT_SETUP.md)
- [部署成功报告](DEPLOYMENT_SUCCESS_STREAM_CHAT.md)
- [部署清单](DEPLOYMENT_CHECKLIST.md)
- [快速部署指南](QUICK_DEPLOY.md)

## ✨ 下一步

1. **当前可用**:
   - ✅ 访问 https://evershop-fly.fly.dev
   - ✅ 浏览产品和购物功能
   - ✅ 使用现有的 chatbot 功能

2. **可选增强**:
   - 🔄 启用 Stream Chat UI (参考上面步骤)
   - 🔄 自定义 widget 外观
   - 🔄 配置 webhook 通知
   - 🔄 集成数据同步

## 🆘 获取帮助

- **Fly.io**: https://fly.io/docs/
- **Stream Chat**: https://getstream.io/chat/docs/
- **Coze**: https://www.coze.cn/docs

---

**状态**: ✅ 生产环境运行正常  
**最后更新**: 2025-11-01


