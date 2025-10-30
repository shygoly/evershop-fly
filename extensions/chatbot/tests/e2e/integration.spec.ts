/**
 * Integration Tests: ShopSaaS → chatbot-node → EverShop
 */

import { test, expect } from '@playwright/test';

const SHOPSAAS_URL = process.env.SHOPSAAS_URL || 'https://shopsaas.fly.dev';
const CHATBOT_NODE_URL = process.env.CHATBOT_NODE_URL || 'https://chatbot-node.fly.dev';
const EVERSHOP_URL = process.env.EVERSHOP_URL || 'http://localhost:3000';

test.describe('Full Integration Flow', () => {
  test.skip('should complete full chatbot enablement flow', async ({ page, context }) => {
    // This is a comprehensive test that requires:
    // 1. ShopSaaS account with credits
    // 2. Existing EverShop instance
    // 3. chatbot-node service running
    
    // Step 1: Login to ShopSaaS
    await page.goto(`${SHOPSAAS_URL}/sign-in`);
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL(`${SHOPSAAS_URL}/dashboard`);
    
    // Step 2: Enable chatbot for a shop
    const enableButton = page.locator('button:has-text("启用智能客服")').first();
    
    // Check if button exists and is enabled
    if (await enableButton.isVisible()) {
      // Get current credits
      const creditsText = await page.locator('#credits').textContent();
      const currentCredits = parseInt(creditsText || '0');
      
      if (currentCredits >= 50) {
        // Click enable
        await enableButton.click();
        
        // Confirm dialog
        await page.locator('text=确认继续').click();
        
        // Wait for success message
        await expect(page.locator('text=智能客服启用成功')).toBeVisible({ timeout: 30000 });
        
        // Verify credits deducted
        const newCreditsText = await page.locator('#credits').textContent();
        const newCredits = parseInt(newCreditsText || '0');
        expect(newCredits).toBe(currentCredits - 50);
        
        // Verify chatbot status badge appears
        await expect(page.locator('text=智能客服已启用')).toBeVisible();
      }
    }
    
    // Step 3: Verify EverShop has chatbot widget
    // Open EverShop instance in new tab
    const evershopPage = await context.newPage();
    await evershopPage.goto(EVERSHOP_URL);
    
    // Wait for chatbot button to appear
    await expect(evershopPage.locator('.chat-button')).toBeVisible({ timeout: 20000 });
    
    // Test chatbot functionality
    await evershopPage.locator('.chat-button').click();
    await evershopPage.locator('.message-input textarea').fill('Hello from integration test');
    await evershopPage.locator('.send-button').click();
    
    // Verify message sent and response received
    await expect(evershopPage.locator('.message-bubble.user')).toContainText('Hello from integration test');
    await expect(evershopPage.locator('.message-bubble.assistant')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('ChatbotNodeClient API Tests', () => {
  test('should successfully authenticate with chatbot-node', async ({ request }) => {
    // Test JWT authentication
    const shopId = process.env.TEST_SHOP_ID || 'shop-test';
    const ssoSecret = process.env.TEST_SSO_SECRET;
    
    if (!ssoSecret) {
      test.skip();
      return;
    }
    
    // Generate JWT (simplified - in real scenario use proper JWT library)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { shopId, role: 'admin' },
      ssoSecret,
      { issuer: 'shopsaas', audience: 'chatbot-node', expiresIn: '1h' }
    );
    
    // Test API call with JWT
    const response = await request.get(`${CHATBOT_NODE_URL}/api/admin/tenants/${shopId}/config`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('shopId', shopId);
  });

  test('should handle chat API streaming', async ({ page }) => {
    // Navigate to EverShop
    await page.goto(EVERSHOP_URL);
    
    // Open chatbot
    await page.locator('.chat-button').click();
    
    // Monitor network requests
    const chatRequests: any[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/coze/chat')) {
        chatRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
        });
      }
    });
    
    // Send message
    await page.locator('.message-input textarea').fill('测试streaming');
    await page.locator('.send-button').click();
    
    // Wait a bit for request to be captured
    await page.waitForTimeout(2000);
    
    // Verify chat request was made
    expect(chatRequests.length).toBeGreaterThan(0);
    expect(chatRequests[0].method).toBe('POST');
    expect(chatRequests[0].headers).toHaveProperty('authorization');
  });
});

test.describe('Data Sync Tests', () => {
  test.skip('should sync product data to chatbot knowledge base', async ({ page }) => {
    // Login to EverShop admin
    await page.goto(`${EVERSHOP_URL}/admin/login`);
    // ... login flow
    
    // Navigate to chatbot settings
    await page.goto(`${EVERSHOP_URL}/admin/chatbot/settings`);
    
    // Click sync products button
    await page.locator('button:has-text("同步产品")').click();
    
    // Wait for sync success
    await expect(page.locator('text=产品同步成功')).toBeVisible({ timeout: 30000 });
    
    // Verify sync count
    const syncMessage = await page.locator('.sync-result').textContent();
    expect(syncMessage).toMatch(/\d+ 产品/);
  });
});

test.describe('Error Handling', () => {
  test('should handle chatbot-node service unavailable', async ({ page }) => {
    // Mock chatbot-node API to fail
    await page.route('**/api/coze/chat', (route) => {
      route.abort('failed');
    });
    
    await page.goto(EVERSHOP_URL);
    await page.locator('.chat-button').click();
    await page.locator('.message-input textarea').fill('测试错误');
    await page.locator('.send-button').click();
    
    // Verify error status
    await expect(page.locator('.message-status.error')).toBeVisible({ timeout: 5000 });
  });

  test('should handle network timeout gracefully', async ({ page }) => {
    // Mock slow response
    await page.route('**/api/coze/chat', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 35000)); // Longer than timeout
      route.continue();
    });
    
    await page.goto(EVERSHOP_URL);
    await page.locator('.chat-button').click();
    await page.locator('.message-input textarea').fill('超时测试');
    await page.locator('.send-button').click();
    
    // Should show error after timeout
    await expect(page.locator('.message-status.error')).toBeVisible({ timeout: 40000 });
  });

  test('should handle invalid JWT token', async ({ request }) => {
    const response = await request.get(`${CHATBOT_NODE_URL}/api/admin/tenants/shop-test/config`, {
      headers: {
        'Authorization': 'Bearer invalid_token_here',
      },
    });
    
    // Should return 401 or 403
    expect([401, 403]).toContain(response.status());
  });
});

test.describe('Security Tests', () => {
  test('should not expose SSO secrets in client code', async ({ page }) => {
    await page.goto(EVERSHOP_URL);
    
    // Check all script contents
    const scripts = await page.$$eval('script', (elements) =>
      elements.map((el) => el.textContent)
    );
    
    // Verify no secrets in client-side code
    const allScripts = scripts.join(' ');
    expect(allScripts).not.toContain('CHATBOT_SSO_SECRET');
    expect(allScripts).not.toContain('CHATBOT_WEBHOOK_SECRET');
  });

  test('should include Authorization header in API requests', async ({ page }) => {
    await page.goto(EVERSHOP_URL);
    
    const requests: any[] = [];
    page.on('request', (request) => {
      if (request.url().includes('chatbot') || request.url().includes('coze')) {
        requests.push({
          url: request.url(),
          hasAuth: !!request.headers()['authorization'],
        });
      }
    });
    
    // Open chat and send message
    await page.locator('.chat-button').click();
    await page.locator('.message-input textarea').fill('安全测试');
    await page.locator('.send-button').click();
    
    await page.waitForTimeout(2000);
    
    // Verify auth header is present
    const chatRequests = requests.filter(r => r.url.includes('/api/coze/chat'));
    if (chatRequests.length > 0) {
      expect(chatRequests[0].hasAuth).toBe(true);
    }
  });
});

