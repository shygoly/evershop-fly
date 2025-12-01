# EverShop 后台管理员聊天集成指南

## 概述

本指南说明如何为 EverShop 后台管理员（如 guoliang@szchada.com）集成 Stream Chat 实时聊天客户端插件，使管理员能够在后台直接与客户进行实时对话。

## 新增组件

### 1. AdminChatPanel.jsx
**位置**: `extensions/chatbot/src/pages/admin/adminChat/AdminChatPanel.jsx`

- 后台管理员聊天面板组件
- 从会话获取管理员信息
- 标记用户角色为 'admin'
- 加载失败时显示友好提示

**关键特性**:
```jsx
- userId: admin-${adminId} // 管理员ID
- userRole: 'admin'        // 管理员角色
- shopId: 'evershop-fly'   // 店铺ID
```

### 2. AdminChatPanel.scss
**位置**: `extensions/chatbot/src/pages/admin/adminChat/AdminChatPanel.scss`

- 固定位置聊天面板（右下角）
- 响应式设计（支持平板和手机）
- 加载和错误状态样式

**布局规格**:
```
- 桌面: 450px × 650px (右下角)
- 平板: 400px × 600px
- 手机: 100% × 100% (全屏)
```

### 3. 路由配置
**文件**: `extensions/chatbot/src/pages/admin/adminChat/route.json`

```json
{
  "routeId": "adminChat",
  "path": "/admin/chatbot/chat"
}
```

### 4. 索引文件
**文件**: `extensions/chatbot/src/pages/admin/adminChat/index.ts`

导出 AdminChatPanel 组件，供 EverShop 路由系统使用。

## 菜单集成更新

### ChatbotMenuGroup.jsx 更新

在后台左侧菜单中添加 "Admin Chat" 选项：

**菜单项添加**:
```jsx
{
  Icon: ChatAltIcon,
  url: adminChat,
  title: "Admin Chat",
}
```

**路由查询**:
```graphql
query Query {
  adminChat: url(routeId:"adminChat")
  chatbotDashboard: url(routeId:"chatbotDashboard")
  chatbotSettings: url(routeId:"chatbotSettings")
}
```

## 访问流程

### 步骤 1: 登录后台
```
URL: https://evershop-fly-test112903.fly.dev/admin
用户名: guoliang@szchada.com
密码: admin123
```

### 步骤 2: 访问聊天
在左侧菜单中点击：
- **Chatbot** > **Admin Chat**

或直接访问:
```
https://evershop-fly-test112903.fly.dev/admin/chatbot/chat
```

## 功能概述

### 管理员端功能
| 功能 | 描述 |
|------|------|
| 实时聊天 | 与客户实时对话 |
| 消息历史 | 查看完整聊天记录 |
| 客户信息 | 显示客户资料 |
| 自动分配 | Stream Chat 自动路由 |
| 离线消息 | 支持消息持久化 |

### 客户端功能
| 功能 | 描述 |
|------|------|
| 聊天窗口 | 页面右下角浮动窗口 |
| 实时消息 | 即时收发消息 |
| 消息通知 | 未读消息提示 |
| 文件分享 | 支持图片/文件上传 |

## 技术架构

```
┌─────────────────────────────────────────┐
│         EverShop 前端 (客户)             │
│                                         │
│  StreamChatWidgetLoader                │
│  └─ 聊天窗口 (右下角)                   │
└────────────┬──────────────────────────┘
             │
             │ WebSocket / REST API
             │
        ┌────▼──────────────────┐
        │   Stream Chat SDK      │
        │   (stream-chat)        │
        └────┬──────────────────┘
             │
             │ JWT Token (SSO)
             │
┌────────────▼──────────────────────────┐
│      Stream Chat Cloud Service        │
│                                       │
│  - 消息存储                           │
│  - 用户管理                           │
│  - 通道管理                           │
│  - WebSocket 连接                     │
└────────────┬──────────────────────────┘
             │
             │
┌────────────▼──────────────────────────┐
│    EverShop 后台 (管理员)              │
│                                       │
│  AdminChatPanel                      │
│  └─ StreamChatWidget                │
│     └─ 聊天面板                     │
└────────────────────────────────────┘
```

## 配置要求

### 1. Stream Chat 凭证

在 `extensions/chatbot/config.json` 中配置:

```json
{
  "streamChat": {
    "apiKey": "your-stream-api-key",
    "apiSecret": "your-stream-api-secret",
    "enabled": true
  }
}
```

### 2. 环境变量 (Fly.io)

```bash
flyctl secrets set \
  STREAM_CHAT_API_KEY="pk_xxx" \
  STREAM_CHAT_API_SECRET="xxx" \
  STREAM_CHAT_ENABLED="true" \
  -a evershop-fly-test112903
```

### 3. 管理员用户

确保管理员账户已创建：
```bash
npm run user:create -- \
  --email guoliang@szchada.com \
  --password admin123 \
  --name "Admin User"
```

## 部署步骤

### 开发环境

```bash
cd extensions/chatbot
npm run build

cd ../../
npm run dev
```

访问: http://localhost:3000/admin

### 生产环境 (Fly.io)

```bash
cd evershop-fly
flyctl deploy -a evershop-fly-test112903
```

## 使用场景

### 场景 1: 客户发起聊天
1. 客户在店铺页面点击聊天窗口
2. 输入消息
3. 消息发送到 Stream Chat

### 场景 2: 管理员应答
1. 管理员登录后台
2. 点击 Chatbot > Admin Chat
3. 查看来自客户的消息
4. 实时回复

### 场景 3: 消息历史
1. 所有消息存储在 Stream Chat
2. 支持消息搜索
3. 支持聊天转移

## 故障排除

### 问题 1: 聊天面板不显示

**检查列表**:
- [ ] Stream Chat 凭证已配置
- [ ] `STREAM_CHAT_ENABLED=true`
- [ ] 浏览器控制台无错误
- [ ] 网络连接正常

```bash
# 检查日志
flyctl logs -a evershop-fly-test112903 --no-tail | grep -i "chat"
```

### 问题 2: 消息无法发送

**检查列表**:
- [ ] 确认管理员已登录
- [ ] Stream Chat 服务正常
- [ ] API Secret 正确配置
- [ ] JWT token 有效

### 问题 3: 菜单中缺少 "Admin Chat"

**解决方案**:
```bash
# 重新编译
cd extensions/chatbot
npm run build

# 清除浏览器缓存并刷新
```

## 文件清单

### 新增文件
- `src/pages/admin/adminChat/AdminChatPanel.jsx` - 管理员聊天面板
- `src/pages/admin/adminChat/AdminChatPanel.scss` - 聊天面板样式
- `src/pages/admin/adminChat/index.ts` - 组件导出
- `src/pages/admin/adminChat/route.json` - 路由配置

### 修改文件
- `src/pages/admin/all/ChatbotMenuGroup.jsx` - 添加菜单项

### 编译输出
- `dist/pages/admin/adminChat/index.js` - 编译后的组件
- `dist/pages/admin/adminChat/AdminChatPanel.scss` - 编译后的样式
- `dist/pages/admin/adminChat/route.json` - 路由配置

## 性能考虑

### 消息同步
- 使用 WebSocket 实时同步
- 自动重连机制
- 消息缓冲和离线支持

### 资源占用
- Stream Chat SDK: ~50KB gzip
- 聊天窗口: 450×650px (可调整)
- 内存: ~5-10MB (取决于消息数量)

## 安全性

### 认证
- JWT token 认证
- 管理员角色验证
- 会话超时控制

### 数据隐私
- 加密传输 (HTTPS/WSS)
- 消息持久化加密
- 用户数据隔离

## 下一步

1. **配置 Stream Chat**
   - 注册 Stream Chat 账户
   - 获取 API Key 和 Secret
   - 配置环境变量

2. **测试功能**
   - 客户端发起聊天
   - 管理员实时应答
   - 验证消息同步

3. **优化体验**
   - 配置欢迎消息
   - 添加快速回复
   - 设置转移规则

4. **监控分析**
   - 配置聊天统计
   - 设置性能告警
   - 定期审查日志

## 参考资源

- [Stream Chat 文档](https://getstream.io/chat/docs/)
- [EverShop 扩展指南](https://evershop.io/docs/)
- [AdminChatPanel 源码](./src/pages/admin/adminChat/)

## 技术支持

如有问题，请检查:
1. Fly.io 日志: `flyctl logs -a evershop-fly-test112903`
2. 浏览器控制台错误
3. Stream Chat 服务状态
4. 网络连接和防火墙设置

---

**最后更新**: 2025年12月1日
**版本**: 1.0.0
**作者**: EverShop Team
