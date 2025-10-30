# Chatbot Widget - 前台聊天组件

## 概述

为店铺买家提供的AI智能客服聊天组件，支持实时对话、历史记录、移动端适配。

## 功能特性

### 🎨 用户界面
- ✅ 悬浮聊天按钮（右下角）
- ✅ 弹出式聊天窗口
- ✅ 消息气泡设计
- ✅ 头像显示（店铺 Logo）
- ✅ 在线状态指示
- ✅ 输入框自动聚焦
- ✅ 发送按钮动画
- ✅ 加载状态显示

### 💬 聊天功能
- ✅ 实时消息发送
- ✅ AI 自动回复
- ✅ 对话历史记录
- ✅ 会话持久化
- ✅ 欢迎消息
- ✅ 错误处理
- ✅ 离线提示

### 📱 响应式设计
- ✅ 桌面端优化（380x600px）
- ✅ 移动端适配（全屏模式）
- ✅ 平板适配
- ✅ 暗黑模式支持

## 文件结构

```
extensions/chatbot/
├── src/
│   ├── components/
│   │   ├── ChatWidget.jsx          # 主聊天组件
│   │   └── ChatWidget.scss         # 样式文件
│   ├── pages/frontStore/all/
│   │   ├── ChatbotWidget.jsx       # GraphQL 版本集成
│   │   └── ChatbotWidgetLoader.jsx # API 版本集成
│   ├── api/
│   │   ├── sendMessage/            # 发送消息 API
│   │   │   ├── route.json
│   │   │   └── sendMessage.ts
│   │   └── getChatHistory/         # 获取历史 API
│   │       ├── route.json
│   │       └── getChatHistory.ts
│   ├── services/
│   │   └── ChatService.ts          # 聊天服务
│   └── migration/
│       └── Version-1.0.1.ts        # 聊天表迁移
```

## 数据库表

### chatbot_conversation 表

存储聊天会话信息：

| 字段 | 类型 | 说明 |
|------|------|------|
| conversation_id | VARCHAR(255) | 会话唯一标识（主键）|
| uuid | UUID | UUID 标识 |
| shop_id | VARCHAR(255) | 店铺 ID |
| customer_email | VARCHAR(255) | 客户邮箱 |
| customer_name | VARCHAR(255) | 客户名称 |
| status | VARCHAR(50) | 会话状态（active/closed）|
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### chatbot_message 表

存储聊天消息：

| 字段 | 类型 | 说明 |
|------|------|------|
| message_id | INT | 消息 ID（主键）|
| uuid | UUID | UUID 标识 |
| conversation_id | VARCHAR(255) | 所属会话 ID |
| shop_id | VARCHAR(255) | 店铺 ID |
| sender | VARCHAR(10) | 发送者（user/bot）|
| content | TEXT | 消息内容 |
| created_at | TIMESTAMP | 创建时间 |

## API 端点

### 1. 发送消息

**端点**: `POST /api/chatbot/chat/send`

**请求体**:
```json
{
  "shop_id": "evershop-default",
  "conversation_id": "conv_1234567890_abc", // 可选，新对话时不传
  "content": "你好，请问有什么产品推荐？",
  "customer_email": "customer@example.com", // 可选
  "customer_name": "张三" // 可选
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "conversation_id": "conv_1234567890_abc",
    "user_message": "你好，请问有什么产品推荐？",
    "bot_response": "您好！我们有多款优质产品...",
    "timestamp": "2025-10-27T10:00:00Z"
  }
}
```

### 2. 获取聊天历史

**端点**: `GET /api/chatbot/chat/history?conversation_id=conv_xxx`

**响应**:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "conversation_id": "conv_1234567890_abc",
      "shop_id": "evershop-default",
      "status": "active",
      "created_at": "2025-10-27T09:00:00Z"
    },
    "messages": [
      {
        "message_id": 1,
        "content": "你好，请问有什么产品推荐？",
        "sender": "user",
        "created_at": "2025-10-27T09:00:05Z"
      },
      {
        "message_id": 2,
        "content": "您好！我们有多款优质产品...",
        "sender": "bot",
        "created_at": "2025-10-27T09:00:08Z"
      }
    ]
  }
}
```

## 使用方法

### 自动集成

组件会自动加载到所有前台页面：

1. 编译应用：`npm run build`
2. 启动服务：`npm run dev`
3. 访问任何前台页面
4. 查看右下角的聊天按钮 💬

### 手动集成

如果需要在特定页面集成：

```jsx
import ChatWidget from '@evershop/chatbot/components/ChatWidget';

function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <ChatWidget
        shopId="evershop-default"
        shopName="My Store"
        shopLogo="https://example.com/logo.png"
      />
    </div>
  );
}
```

## 组件 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| shopId | string | 'evershop-default' | 店铺 ID |
| shopName | string | 'AI 客服' | 店铺名称 |
| shopLogo | string | null | 店铺 Logo URL |

## 交互流程

### 1. 首次打开聊天

```
用户点击聊天按钮
  ↓
聊天窗口展开
  ↓
显示欢迎消息
  ↓
准备接收用户输入
```

### 2. 发送消息

```
用户输入消息 + 点击发送
  ↓
消息立即显示（乐观更新）
  ↓
POST /api/chatbot/chat/send
  ↓
后端调用 chatbotadmin API
  ↓
chatbotadmin → Coze AI
  ↓
AI 生成回复
  ↓
保存消息到数据库
  ↓
返回 Bot 回复
  ↓
显示在聊天窗口
```

### 3. 加载历史记录

```
打开已有会话
  ↓
GET /api/chatbot/chat/history
  ↓
从数据库加载消息
  ↓
显示历史对话
  ↓
滚动到最新消息
```

## 样式定制

### 修改主题色

编辑 `ChatWidget.scss`：

```scss
.chat-button {
  // 修改渐变色
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}

.chat-header {
  // 修改头部背景
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

### 修改窗口大小

```scss
.chat-window {
  width: 400px;    // 默认 380px
  height: 650px;   // 默认 600px
}
```

### 自定义头像

不使用 Logo 时的默认头像：

```scss
.avatar-placeholder {
  // 改成您的图标或 emoji
  content: '🛍️'; // 或其他图标
}
```

## 功能扩展

### 添加图片发送

修改 `ChatWidget.jsx`，添加文件上传：

```jsx
const [selectedImages, setSelectedImages] = useState([]);

// 在 handleSend 中包含图片
body: JSON.stringify({
  shop_id: shopId,
  content: inputValue,
  images: selectedImages // 发送图片 URL
})
```

### 添加快捷回复

```jsx
const quickReplies = [
  '查看产品',
  '订单状态',
  '退换货政策',
  '联系客服'
];

// 在聊天窗口添加快捷回复按钮
{quickReplies.map(reply => (
  <button onClick={() => setInputValue(reply)}>
    {reply}
  </button>
))}
```

### 添加输入提示

```jsx
const [isTyping, setIsTyping] = useState(false);

// 在发送消息时显示"正在输入..."
{isTyping && (
  <div className="typing-indicator">
    <span></span><span></span><span></span>
  </div>
)}
```

## 性能优化

### 1. 懒加载

组件仅在用户点击聊天按钮时才加载历史记录：

```jsx
useEffect(() => {
  if (isOpen && conversationId) {
    loadChatHistory(); // 仅在打开时加载
  }
}, [isOpen, conversationId]);
```

### 2. 消息分页

限制加载的消息数量：

```typescript
// ChatService.ts
static async getMessages(conversationId: string, limit: number = 50)
```

### 3. 防抖发送

防止用户重复点击发送按钮：

```jsx
const [isSending, setIsSending] = useState(false);

const handleSend = async () => {
  if (isSending) return; // 防止重复发送
  setIsSending(true);
  // ... 发送逻辑
  setIsSending(false);
};
```

## 移动端优化

### 自动适配

在移动设备上，聊天窗口会全屏显示：

```scss
@media (max-width: 480px) {
  .chat-window {
    width: calc(100vw - 20px);
    height: calc(100vh - 20px);
  }
}
```

### 虚拟键盘处理

当用户输入时，窗口会自动调整以避免被键盘遮挡（浏览器原生支持）。

## 安全性

### 1. XSS 防护

React 自动转义文本内容，防止 XSS 攻击。

### 2. Rate Limiting

建议在生产环境添加速率限制：

```typescript
// 在 sendMessage.ts 中添加
const rateLimitKey = `chat_rate_limit_${customer_email}`;
// 实现速率限制逻辑
```

### 3. 输入验证

消息内容已在后端验证，最大长度限制建议 1000 字符。

## 测试

### 功能测试

1. **打开/关闭聊天窗口**
   - 点击聊天按钮，窗口应展开
   - 点击关闭按钮，窗口应收起

2. **发送消息**
   - 输入文本 + 点击发送
   - 消息应立即显示
   - 应收到 Bot 回复

3. **历史记录**
   - 刷新页面
   - 重新打开聊天
   - 应显示之前的对话

4. **移动端**
   - 在手机浏览器测试
   - 窗口应全屏显示
   - 键盘弹出时正常工作

### API 测试

```bash
# 测试发送消息
curl -X POST "http://localhost:3000/api/chatbot/chat/send" \
  -H "Content-Type: application/json" \
  -d '{
    "shop_id": "evershop-default",
    "content": "你好"
  }'

# 测试获取历史
curl "http://localhost:3000/api/chatbot/chat/history?conversation_id=conv_xxx"
```

## 故障排除

### 问题：聊天按钮不显示

**解决方案**:
1. 检查是否已配置 Bot（访问 Admin → Chatbot → Settings）
2. 确认 `botId` 存在于数据库
3. 清除浏览器缓存
4. 检查控制台错误

### 问题：发送消息无响应

**解决方案**:
1. 检查 chatbotadmin 后端是否运行
2. 查看浏览器控制台错误
3. 检查网络请求（开发者工具 → Network）
4. 验证 API 端点可访问

### 问题：历史记录不加载

**解决方案**:
1. 检查 conversation_id 是否正确
2. 查看数据库表是否创建：
   ```sql
   SELECT * FROM chatbot_conversation;
   SELECT * FROM chatbot_message;
   ```
3. 检查 API 响应

## 自定义配置

### 修改欢迎消息

编辑 `ChatWidget.jsx`:

```jsx
const welcomeMessage = {
  id: 0,
  content: `您好！我是${shopName}的AI客服助手，很高兴为您服务！\n\n我可以帮您：\n- 查找商品信息\n- 查询订单状态\n- 解答常见问题\n\n请问有什么可以帮助您的？`,
  sender: 'bot',
  timestamp: new Date()
};
```

### 修改按钮位置

```scss
.chatbot-widget {
  // 左下角
  bottom: 20px;
  left: 20px; // 改为 left

  // 或顶部
  top: 20px;
  right: 20px;
  bottom: auto;
}
```

### 添加声音提示

```jsx
// 收到新消息时播放提示音
const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play().catch(e => console.log('Audio play failed:', e));
};

// 在收到 bot 回复时调用
playNotificationSound();
```

## 最佳实践

### 1. 用户体验

- ✅ 快速响应（< 3秒）
- ✅ 清晰的加载状态
- ✅ 友好的错误提示
- ✅ 流畅的动画效果
- ✅ 直观的操作提示

### 2. 性能优化

- ✅ 按需加载历史记录
- ✅ 限制消息数量
- ✅ 虚拟滚动（大量消息时）
- ✅ 图片懒加载
- ✅ 防抖输入

### 3. 可访问性

- ✅ ARIA 标签
- ✅ 键盘导航支持
- ✅ 屏幕阅读器友好
- ✅ 高对比度模式

## 部署注意事项

### 生产环境

1. **启用 HTTPS**
   - 聊天组件需要在 HTTPS 下运行
   - 混合内容可能导致功能异常

2. **CDN 优化**
   - 将 Logo 和静态资源放到 CDN
   - 减少加载时间

3. **监控**
   - 监控聊天 API 响应时间
   - 跟踪消息发送成功率
   - 记录错误日志

### 容量规划

预估每天 1000 个对话：
- 消息数：~5000 条/天
- 数据库大小：~1MB/天
- API 调用：~5000 次/天

建议定期清理旧对话（如 90 天前）。

## 监控和分析

### 查看聊天统计

```sql
-- 今日对话数
SELECT COUNT(DISTINCT conversation_id) as conversations
FROM chatbot_message
WHERE created_at > CURRENT_DATE;

-- 今日消息数
SELECT COUNT(*) as messages
FROM chatbot_message
WHERE created_at > CURRENT_DATE;

-- 平均响应时间（需要添加时间戳字段）
SELECT AVG(
  EXTRACT(EPOCH FROM (bot_time - user_time))
) as avg_response_seconds
FROM (
  SELECT
    conversation_id,
    LAG(created_at) OVER (PARTITION BY conversation_id ORDER BY created_at) as user_time,
    created_at as bot_time,
    sender
  FROM chatbot_message
) subq
WHERE sender = 'bot';
```

### 常见问题分析

```sql
-- 最常见的用户问题（需要添加分类字段）
SELECT content, COUNT(*) as frequency
FROM chatbot_message
WHERE sender = 'user'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY content
ORDER BY frequency DESC
LIMIT 10;
```

## 高级功能（未来版本）

### 规划中的功能

1. **Rich Media 支持**
   - 图片发送
   - 文件上传
   - 商品卡片
   - 订单卡片

2. **智能推荐**
   - 相关产品推荐
   - 热门商品展示
   - 优惠券推送

3. **多语言支持**
   - 自动检测用户语言
   - 多语言回复
   - 翻译功能

4. **离线消息**
   - 离线时保存消息
   - 上线后自动发送
   - 消息队列

5. **情感分析**
   - 检测用户情绪
   - 自动升级到人工客服
   - 满意度调查

## 成功案例

### 示例对话

**客户**: "这款T恤有XL号吗？"
**AI客服**: "您好！根据我们的产品库存，这款T恤目前有S、M、L、XL、XXL五种尺码可选。XL号有货哦！您需要了解更多关于这款T恤的信息吗？"

**客户**: "价格多少？"
**AI客服**: "这款T恤目前的价格是 ¥199。我们现在有促销活动，满200减30，您可以考虑多选一件搭配哦！"

**客户**: "运费怎么算？"
**AI客服**: "我们提供以下配送方式：\n- 满99元包邮\n- 未满99元，运费¥10\n- 部分偏远地区可能有额外运费\n\n您的订单满足包邮条件，无需支付运费！"

## 结论

聊天组件已完全实现，包括：
- ✅ 现代化UI设计
- ✅ 实时消息交互
- ✅ 完整的后端支持
- ✅ 移动端适配
- ✅ 错误处理
- ✅ 性能优化

**状态**: 生产就绪 🚀

用户现在可以在您的 EverShop 店铺享受智能客服服务！

