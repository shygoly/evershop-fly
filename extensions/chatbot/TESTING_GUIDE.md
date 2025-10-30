# Chatbot Extension 测试指南

## 测试概述

本扩展包含三种类型的测试：

1. **单元测试** - 测试Hooks和服务
2. **E2E测试** - 测试Widget用户交互
3. **集成测试** - 测试ShopSaaS → chatbot-node → EverShop完整流程

## 环境准备

### 1. 安装依赖

```bash
cd /Users/mac/Sync/project/ecommerce/evershop-src/extensions/chatbot
npm install
```

### 2. 安装Playwright浏览器

```bash
npx playwright install
```

### 3. 配置测试环境变量

创建 `.env.test` 文件：

```bash
# EverShop配置
CHATBOT_ENABLED=true
CHATBOT_NODE_URL=http://localhost:3000
CHATBOT_SHOP_ID=shop-test
CHATBOT_SSO_SECRET=test-secret-key
CHATBOT_WEBHOOK_SECRET=test-webhook-secret

# ShopSaaS配置（集成测试）
SHOPSAAS_URL=https://shopsaas.fly.dev
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password

# 测试配置
TEST_URL=http://localhost:3000
```

## 单元测试

### 运行所有单元测试

```bash
npm run test
```

### 监听模式（开发时）

```bash
npm run test:watch
```

### 生成覆盖率报告

```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录。

### 运行特定测试文件

```bash
npm test -- useChatStorage.test.ts
```

### 测试覆盖的内容

#### useChatStorage测试
- ✅ 会话ID生成和持久化
- ✅ 消息保存和加载
- ✅ 最大消息数限制（100条）
- ✅ 24小时过期自动清理
- ✅ 错误处理（localStorage满等）

#### ChatbotNodeClient测试
- ✅ JWT token生成和验证
- ✅ Token过期时间（1小时）
- ✅ Webhook签名验证
- ✅ API方法（getTenantConfig, syncDataset等）
- ✅ 错误处理和重试

## E2E测试

### 运行所有E2E测试

```bash
npm run test:e2e
```

### UI模式（推荐）

```bash
npm run test:e2e:ui
```

这会打开Playwright UI，可以：
- 查看所有测试
- 单独运行某个测试
- 查看测试步骤
- 时间旅行调试

### Headed模式（查看浏览器）

```bash
npm run test:e2e:headed
```

### 运行特定测试

```bash
npx playwright test chatbot-widget.spec.ts
```

### 运行特定浏览器

```bash
npx playwright test --project=chromium
npx playwright test --project=webkit
npx playwright test --project=firefox
```

### 测试覆盖的内容

#### Widget UI测试
- ✅ 浮动按钮显示
- ✅ 点击打开/关闭聊天窗口
- ✅ 发送和接收消息
- ✅ Enter键发送，Shift+Enter换行
- ✅ 消息持久化（刷新页面后保留）
- ✅ 错误状态显示
- ✅ 空输入禁用发送按钮
- ✅ 响应式布局（移动端）
- ✅ 自动滚动到最新消息

#### 性能测试
- ✅ Widget加载时间 < 2秒
- ✅ 快速连续发送消息处理

#### 安全测试
- ✅ 客户端代码不暴露secrets
- ✅ API请求包含Authorization header

## 集成测试

### 完整流程测试

此测试需要三个服务都在运行：
1. ShopSaaS
2. chatbot-node
3. EverShop

```bash
# 启动所有服务后运行
npm run test:e2e integration.spec.ts
```

### 测试流程

1. **登录ShopSaaS**
2. **启用智能客服** (-50积分)
3. **验证chatbot-node租户创建**
4. **访问EverShop店铺**
5. **验证Widget显示**
6. **测试聊天功能**
7. **验证数据同步**

### 手动集成测试步骤

#### 步骤1: 在ShopSaaS启用chatbot

1. 访问 https://shopsaas.fly.dev
2. 登录账号
3. 找到你的店铺
4. 点击"启用智能客服"按钮
5. 确认扣除50积分
6. 等待成功提示

#### 步骤2: 验证EverShop配置

```bash
# SSH到EverShop Fly app
fly ssh console -a your-shop-app

# 检查环境变量
echo $CHATBOT_ENABLED
echo $CHATBOT_NODE_URL
echo $CHATBOT_SHOP_ID
```

#### 步骤3: 测试Widget

1. 访问你的EverShop店铺
2. 查看右下角是否有红色聊天按钮
3. 点击按钮打开聊天窗口
4. 发送测试消息
5. 验证AI回复

#### 步骤4: 测试数据同步

1. 登录EverShop管理后台
2. 导航到 Chatbot → Settings
3. 点击"同步产品"按钮
4. 等待同步完成
5. 验证同步计数

## 调试技巧

### 1. 查看组件渲染

在浏览器控制台：

```javascript
// 查看Widget状态
window.chatbotDebug = true;

// 强制打开聊天
document.querySelector('.chat-button').click();

// 查看消息历史
JSON.parse(localStorage.getItem('chatbot_messages'));
```

### 2. 查看网络请求

1. 打开浏览器DevTools
2. 切换到Network标签
3. 筛选"coze"或"chat"
4. 查看请求头、响应等

### 3. 查看SSE streaming

```javascript
// 在控制台监听SSE事件
const eventSource = new EventSource('/api/coze/chat');
eventSource.onmessage = (e) => console.log('SSE:', e.data);
```

### 4. 模拟错误场景

在浏览器控制台：

```javascript
// 模拟API错误
fetch('/api/coze/chat', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer invalid_token' },
  body: JSON.stringify({ message: 'test' })
});
```

## CI/CD集成

### GitHub Actions示例

```yaml
name: Chatbot Extension Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd evershop-src/extensions/chatbot
          npm install
      
      - name: Run unit tests
        run: |
          cd evershop-src/extensions/chatbot
          npm run test:coverage
      
      - name: Install Playwright
        run: |
          cd evershop-src/extensions/chatbot
          npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd evershop-src/extensions/chatbot
          npm run test:e2e
        env:
          CHATBOT_ENABLED: true
          CHATBOT_NODE_URL: ${{ secrets.CHATBOT_NODE_URL }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: evershop-src/extensions/chatbot/test-results/
```

## 性能基准

### 目标指标

- Widget加载时间: < 200ms
- 首次渲染: < 100ms
- 消息发送延迟: < 500ms
- 滚动流畅度: 60fps
- 内存占用: < 10MB

### 性能测试

使用Chrome DevTools Performance标签：

1. 打开DevTools
2. 切换到Performance
3. 点击Record
4. 执行操作（打开聊天、发送消息等）
5. 停止录制
6. 分析性能指标

### Lighthouse测试

```bash
# 在Lighthouse中测试性能
# 确保Widget不影响页面性能评分
```

## 常见问题

### Q: Widget在移动端显示不正确？
A: 检查viewport meta标签是否正确，确保响应式样式生效。

### Q: 消息历史丢失？
A: 检查localStorage是否被清除，确保24小时内访问。

### Q: SSE连接失败？
A: 检查chatbot-node服务是否支持CORS，确保Authorization header正确。

### Q: TypeScript编译错误？
A: 确保tsconfig.json包含 "lib": ["dom", "dom.iterable", "esnext"]

### Q: 测试失败？
A: 确保所有服务都在运行，环境变量正确配置。

## 进阶自定义

### 添加Markdown渲染

```bash
npm install react-markdown
```

```tsx
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{message.content}</ReactMarkdown>
```

### 添加代码高亮

```bash
npm install react-syntax-highlighter
```

```tsx
import SyntaxHighlighter from 'react-syntax-highlighter';

<SyntaxHighlighter language="javascript">
  {codeString}
</SyntaxHighlighter>
```

### 添加图片/文件支持

```typescript
interface Message {
  // ... existing fields
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name?: string;
  }[];
}
```

---

**需要帮助？** 查看主README或提交Issue。

