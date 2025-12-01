# 管理员聊天快速启动指南

## 30秒快速开始

### 1. 查看已有功能

✅ **已实现**:
- AdminChatPanel 组件已创建
- 后台菜单项已添加
- Stream Chat 集成已准备
- 代码已提交到 git

### 2. 配置 Stream Chat (必需)

获取凭证:
1. 访问 https://getstream.io/
2. 创建免费账户
3. 创建新应用
4. 复制 API Key 和 API Secret

设置环境变量:
```bash
cd evershop-fly
flyctl secrets set \
  STREAM_CHAT_API_KEY="your-api-key" \
  STREAM_CHAT_API_SECRET="your-api-secret" \
  STREAM_CHAT_ENABLED="true" \
  -a evershop-fly-test112903
```

### 3. 部署

```bash
cd evershop-fly
flyctl deploy -a evershop-fly-test112903
```

### 4. 访问

登录后台:
```
URL: https://evershop-fly-test112903.fly.dev/admin
用户: guoliang@szchada.com
密码: admin123
```

菜单路径: **Chatbot** → **Admin Chat**

## 验证清单

- [ ] Stream Chat 凭证已配置
- [ ] Fly.io 环境变量已设置
- [ ] 应用已部署
- [ ] 后台可正常登录
- [ ] 菜单中可见 "Admin Chat" 选项
- [ ] 聊天面板可正常加载

## 文件清单

### 新增
```
extensions/chatbot/src/pages/admin/adminChat/
├── AdminChatPanel.jsx     (聊天面板组件)
├── AdminChatPanel.scss    (样式)
├── index.ts              (导出)
└── route.json            (路由配置)
```

### 修改
```
extensions/chatbot/src/pages/admin/all/
└── ChatbotMenuGroup.jsx   (菜单项已添加)
```

## 完整功能列表

| 功能 | 状态 | 说明 |
|------|------|------|
| 后台面板 | ✅ | 已实现 |
| 菜单集成 | ✅ | 已实现 |
| 聊天组件 | ✅ | 已实现 |
| 响应式设计 | ✅ | 已实现 |
| Stream Chat | ⏳ | 需配置凭证 |
| 实时消息 | ⏳ | Stream Chat 初始化后 |

## 编译命令

```bash
# 进入扩展目录
cd extensions/chatbot

# 编译 TypeScript
npm run build

# 输出文件
dist/pages/admin/adminChat/
├── index.js                   (编译后的组件)
├── AdminChatPanel.scss        (复制的样式)
└── route.json                 (复制的配置)
```

## 本地开发

```bash
# 启动开发服务器
npm run dev

# 访问
http://localhost:3000/admin

# 用户
guoliang@szchada.com / admin123
```

## 常见问题

### Q: 如何创建管理员用户?
A:
```bash
npm run user:create -- \
  --email guoliang@szchada.com \
  --password admin123 \
  --name "Admin User"
```

### Q: Stream Chat 配置在哪里?
A: `extensions/chatbot/config.json`

### Q: 如何查看日志?
A:
```bash
flyctl logs -a evershop-fly-test112903 --no-tail
```

### Q: 聊天面板为什么不显示?
A: 检查:
1. Stream Chat 凭证是否配置
2. 浏览器控制台是否有错误
3. `STREAM_CHAT_ENABLED` 环境变量

## 工作流

```
┌─ 客户前端 ─┐
│ (聊天窗口)  │
└─────┬──────┘
      │ WebSocket
      │
  ┌───▼──────────────────┐
  │  Stream Chat Cloud   │
  │  (消息存储 & 转发)    │
  └─────────┬──────────┬─┘
            │          │ WebSocket
            │          │
    ┌───────▼──────┐ ┌─▼──────────────┐
    │  管理员后台   │ │ 其他管理员      │
    │ (AdminChat)   │ │ (可选)         │
    └───────────────┘ └────────────────┘
```

## 提示

✨ **Pro 提示**:
- Stream Chat 提供免费开发计划
- 支持最多 100 个并发连接
- 每天 10,000 条消息限制
- 升级到付费计划获得无限制

## 支持

遇到问题? 检查:
1. 📋 完整指南: `ADMIN_CHATBOT_INTEGRATION.md`
2. 🔍 查看日志: `flyctl logs`
3. 📝 查看源码: `extensions/chatbot/src/`

---

**下一步**: 配置 Stream Chat 凭证并部署
