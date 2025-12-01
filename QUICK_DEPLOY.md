# 快速部署指南

## 当前状态

✅ 已配置的 Secrets：
- CHATBOT_ENABLED
- CHATBOT_NODE_URL
- CHATBOT_SHOP_ID
- CHATBOT_SSO_SECRET
- Database 配置
- AWS S3/R2 配置

⚠️ 需要配置的 Secrets（Stream Chat）：
- STREAM_CHAT_ENABLED
- STREAM_CHAT_API_KEY
- STREAM_CHAT_API_SECRET
- CHATBOT_WEBHOOK_SECRET (可选)

## 快速部署命令

### 方案 1: 不启用 Stream Chat（使用现有的 chatbot widget）

当前配置已足够，可以直接部署：

```bash
cd /Users/mac/Sync/project/ecommerce/evershop-fly
fly deploy --app evershop-fly
```

### 方案 2: 启用 Stream Chat

首先获取 Stream Chat 凭据：

1. 访问 https://dashboard.getstream.io/
2. 登录或注册
3. 创建新应用
4. 复制 API Key 和 Secret

然后设置 secrets：

```bash
fly secrets set \
  STREAM_CHAT_ENABLED="true" \
  STREAM_CHAT_API_KEY="你的-stream-api-key" \
  STREAM_CHAT_API_SECRET="你的-stream-api-secret" \
  CHATBOT_WEBHOOK_SECRET="$(openssl rand -hex 32)" \
  --app evershop-fly
```

最后部署：

```bash
fly deploy --app evershop-fly
```

## 验证 chatbot-node 配置

确认 chatbot-node 已正确配置 Coze API：

```bash
# 检查 chatbot-node 状态
fly status --app chatbot-node

# 测试健康检查
curl https://chatbot-node.fly.dev/health

# 应该返回：
# {"status":"ok","timestamp":"..."}
```

## 部署后测试

```bash
# 查看日志
fly logs --app evershop-fly -f

# 打开网站
open https://evershop-fly.fly.dev

# 检查是否有聊天按钮（右下角）
```

## 如果 Stream Chat 未配置

如果没有设置 Stream Chat secrets，应用会：
- ✅ 正常启动
- ✅ 显示传统的 chatbot widget（非 Stream Chat）
- ⚠️ Stream Chat 功能不可用

日志中会显示：
```
Stream Chat is disabled or not configured
```

这是正常的，不影响其他功能。

## 立即部署

如果你想立即部署（不启用 Stream Chat）：

```bash
cd /Users/mac/Sync/project/ecommerce/evershop-fly
fly deploy --app evershop-fly --strategy rolling
```

部署完成后，你可以随时添加 Stream Chat 配置并重新部署。

## 监控部署

```bash
# 实时日志
fly logs --app evershop-fly -f

# 检查状态
fly status --app evershop-fly

# 健康检查
fly checks list --app evershop-fly
```

## 重要提示

- **chatbot-node 依赖**: 确保 chatbot-node 已部署并运行
- **Coze API**: chatbot-node 使用 `https://api.coze.cn`
- **Stream Chat**: 可选功能，可以稍后启用
- **回滚**: 如有问题，可以快速回滚到上一个版本

## 获取帮助

查看详细文档：
- [Stream Chat 设置](extensions/chatbot/STREAM_CHAT_SETUP.md)
- [部署清单](DEPLOYMENT_CHECKLIST.md)
- [chatbot-node 文档](../chatbot-node/docs/)


