# EverShop原生React聊天Widget

## 概述

这是一个完全用React实现的原生聊天Widget，直接集成到EverShop中，替代之前的iframe嵌入方案。

## 特性

- ✅ **原生React组件** - 直接渲染，无iframe开销
- ✅ **SSE实时流式响应** - 打字机效果的AI回复
- ✅ **消息持久化** - localStorage自动保存聊天历史
- ✅ **响应式设计** - 完美适配桌面/平板/手机
- ✅ **打字指示器** - 优雅的打字动画
- ✅ **错误处理** - 自动重试和清晰的错误提示
- ✅ **性能优化** - 懒加载、缓存、平滑动画

## 安装

### 1. 安装依赖

```bash
cd /Users/mac/Sync/project/ecommerce/evershop-src/extensions/chatbot
npm install
```

### 2. 配置环境变量

在EverShop根目录的`.env`文件中添加：

```bash
CHATBOT_ENABLED=true
CHATBOT_NODE_URL=https://chatbot-node.fly.dev
CHATBOT_SHOP_ID=shop-123
CHATBOT_SSO_SECRET=<your-sso-secret>
CHATBOT_WEBHOOK_SECRET=<your-webhook-secret>
```

### 3. 构建扩展

```bash
npm run build
```

### 4. 启动EverShop

```bash
cd /Users/mac/Sync/project/ecommerce/evershop-src
npm run dev
```

## 组件架构

```
ChatWidget (主容器)
├── ChatButton (浮动按钮)
│   └── ChatIcon / CloseIcon
└── ChatWindow (聊天窗口)
    ├── Header
    │   ├── Logo
    │   ├── Bot Name
    │   └── Close Button
    ├── Body
    │   ├── MessageList
    │   │   └── MessageBubble (x N)
    │   └── TypingIndicator
    └── Footer
        └── MessageInput
            ├── Textarea
            └── SendButton
```

## Hooks

### useChatbot
主要的聊天逻辑Hook

```typescript
const {
  isOpen,       // 聊天窗口是否打开
  messages,     // 消息列表
  isLoading,    // 是否正在发送消息
  isTyping,     // AI是否正在回复
  error,        // 错误信息
  toggleChat,   // 切换窗口
  sendMessage,  // 发送消息
  clearMessages,// 清空消息
  resetChat,    // 重置会话
} = useChatbot({ shopId, botId, customerId });
```

### useChatStorage
消息持久化Hook

```typescript
const {
  saveMessages,  // 保存消息到localStorage
  loadMessages,  // 从localStorage加载消息
  getSessionId,  // 获取/创建会话ID
  clearHistory,  // 清空历史
} = useChatStorage();
```

### useSSEStream
SSE流处理Hook（高级用法）

```typescript
const { connect, disconnect } = useSSEStream({
  url: '/api/chat/stream',
  onMessage: (data) => console.log(data),
  onError: (error) => console.error(error),
  onComplete: () => console.log('Complete'),
});
```

## 样式自定义

### 修改主色调

编辑 `src/components/ChatWidget/ChatButton.scss`:

```scss
.chat-button {
  background: #your-color; // 替换 #e53e3e
}
```

编辑 `src/components/ChatWidget/ChatWindow.scss`:

```scss
.chat-header {
  background: #your-color; // 替换 #e53e3e
}
```

编辑 `src/components/ChatWidget/MessageBubble.scss`:

```scss
.message-bubble.user {
  background: #your-color; // 替换 #e53e3e
}
```

### 修改窗口大小

编辑 `src/components/ChatWidget/ChatWindow.scss`:

```scss
.chat-window {
  width: 400px;  // 默认380px
  height: 650px; // 默认600px
}
```

### 修改按钮位置

编辑 `src/components/ChatWidget/ChatButton.scss`:

```scss
.chat-button {
  bottom: 20px;
  right: 20px;  // 改为 left: 20px 可以移到左下角
}
```

## 测试

### 运行单元测试

```bash
npm run test
```

### 运行测试（监听模式）

```bash
npm run test:watch
```

### 生成测试覆盖率报告

```bash
npm run test:coverage
```

### 运行E2E测试

```bash
npm run test:e2e
```

### 运行E2E测试（UI模式）

```bash
npm run test:e2e:ui
```

### 运行E2E测试（headed模式）

```bash
npm run test:e2e:headed
```

## API说明

### ChatbotNodeClient

客户端服务，与chatbot-node API通信。

```typescript
import { chatbotNodeClient } from './services/ChatbotNodeClient';

// 获取租户配置
const config = await chatbotNodeClient.getTenantConfig();

// 更新Bot配置
await chatbotNodeClient.updateBotConfig({
  name: 'My Bot',
  logoUrl: 'https://...',
  syncScopes: ['products', 'orders'],
});

// 同步数据到知识库
const result = await chatbotNodeClient.syncDataset('products', productsData);

// 获取聊天统计
const stats = await chatbotNodeClient.getChatStats();

// 发送聊天消息（流式）
await chatbotNodeClient.sendChatMessage(
  'Hello',
  'user-123',
  (chunk) => console.log('Chunk:', chunk),
  () => console.log('Complete'),
  (error) => console.error('Error:', error)
);
```

## 故障排查

### Widget不显示

1. 检查环境变量:
```bash
echo $CHATBOT_ENABLED
echo $CHATBOT_NODE_URL
echo $CHATBOT_SHOP_ID
```

2. 检查数据库:
```sql
SELECT * FROM chatbot_setting WHERE shop_id = 'your-shop-id';
```

3. 检查浏览器控制台是否有错误

### 消息发送失败

1. 检查chatbot-node服务是否运行:
```bash
curl https://chatbot-node.fly.dev/health
```

2. 检查SSO secret是否正确

3. 检查网络请求（浏览器DevTools Network标签）

### 样式问题

1. 清除浏览器缓存
2. 重新构建:
```bash
npm run build
```
3. 检查CSS是否被其他样式覆盖

## 性能优化建议

### 1. 启用虚拟滚动（大量消息时）

安装react-window:
```bash
npm install react-window
```

修改 `MessageList.tsx`:
```typescript
import { FixedSizeList } from 'react-window';

// 使用虚拟滚动
<FixedSizeList
  height={500}
  itemCount={messages.length}
  itemSize={80}
>
  {Row}
</FixedSizeList>
```

### 2. 实现消息分页

只加载最近的消息，提供"加载更多"按钮。

### 3. 图片懒加载

如果消息包含图片，使用懒加载：

```tsx
<img
  src={imageUrl}
  loading="lazy"
  alt="Message attachment"
/>
```

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**不支持EventSource的浏览器**: 需要添加polyfill或使用轮询fallback

## 开发指南

### 添加新功能

1. 创建新组件: `src/components/ChatWidget/YourComponent.tsx`
2. 添加样式: `src/components/ChatWidget/YourComponent.scss`
3. 导出组件: 在 `index.ts` 中添加导出
4. 在父组件中使用

### 调试技巧

```typescript
// 在组件中添加调试日志
useEffect(() => {
  console.log('[ChatWidget] Messages:', messages);
}, [messages]);

// 在Hook中添加调试
console.log('[useChatbot] Sending message:', text);
```

### 性能监控

```typescript
// 测量渲染时间
useEffect(() => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    console.log(`Render time: ${end - start}ms`);
  };
});
```

## 贡献

欢迎提交PR改进这个扩展！

### 提交前检查清单

- [ ] 所有测试通过
- [ ] 代码格式化（Prettier）
- [ ] 无TypeScript错误
- [ ] 更新文档（如有必要）
- [ ] 添加相应的测试

## 许可证

GPL-3.0

## 支持

如有问题，请提交Issue或联系技术支持。

---

**版本**: 1.0.0  
**最后更新**: 2025-10-30

