/**
 * Playwright E2E Tests for Chatbot Widget
 */

import { test, expect } from '@playwright/test';

test.describe('Chatbot Widget', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to store page
    await page.goto('/');
  });

  test('should display chatbot button on page', async ({ page }) => {
    // Wait for chatbot button to appear
    const chatButton = page.locator('.chat-button');
    await expect(chatButton).toBeVisible({ timeout: 10000 });
    
    // Verify button properties
    await expect(chatButton).toHaveCSS('position', 'fixed');
    await expect(chatButton).toHaveCSS('background-color', 'rgb(229, 62, 62)'); // #e53e3e
  });

  test('should open chat window when button clicked', async ({ page }) => {
    // Click chatbot button
    const chatButton = page.locator('.chat-button');
    await chatButton.waitFor({ state: 'visible', timeout: 10000 });
    await chatButton.click();

    // Verify chat window appears
    const chatWindow = page.locator('.chat-window');
    await expect(chatWindow).toBeVisible();
    
    // Verify header
    await expect(page.locator('.chat-header')).toBeVisible();
    await expect(page.locator('.bot-name')).toContainText('智能客服');
    
    // Verify empty state message
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('should close chat window when close button clicked', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('.chat-button');
    await chatButton.waitFor({ state: 'visible', timeout: 10000 });
    await chatButton.click();

    // Click close button
    const closeButton = page.locator('.close-button');
    await closeButton.click();

    // Verify chat window disappears
    const chatWindow = page.locator('.chat-window');
    await expect(chatWindow).not.toBeVisible();
  });

  test('should send and receive messages', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('.chat-button');
    await chatButton.waitFor({ state: 'visible', timeout: 10000 });
    await chatButton.click();

    // Type message
    const textarea = page.locator('.message-input textarea');
    await textarea.fill('你好');

    // Send message
    const sendButton = page.locator('.send-button');
    await sendButton.click();

    // Verify user message appears
    const userMessage = page.locator('.message-bubble.user').first();
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toContainText('你好');

    // Wait for assistant response
    const assistantMessage = page.locator('.message-bubble.assistant').first();
    await expect(assistantMessage).toBeVisible({ timeout: 15000 });
    
    // Verify typing indicator appeared and disappeared
    // (This is a stretch goal - may not always be visible)
  });

  test('should handle Enter key for sending message', async ({ page }) => {
    // Open chat
    await page.locator('.chat-button').click();

    // Type message and press Enter
    const textarea = page.locator('.message-input textarea');
    await textarea.fill('测试消息');
    await textarea.press('Enter');

    // Verify message sent
    const userMessage = page.locator('.message-bubble.user').first();
    await expect(userMessage).toContainText('测试消息');
  });

  test('should handle Shift+Enter for new line', async ({ page }) => {
    // Open chat
    await page.locator('.chat-button').click();

    // Type message with Shift+Enter
    const textarea = page.locator('.message-input textarea');
    await textarea.fill('第一行');
    await textarea.press('Shift+Enter');
    await textarea.type('第二行');

    // Verify textarea has multiline content
    const value = await textarea.inputValue();
    expect(value).toContain('\n');
    expect(value).toContain('第一行');
    expect(value).toContain('第二行');
  });

  test('should persist messages across page reloads', async ({ page }) => {
    // Open chat and send message
    await page.locator('.chat-button').click();
    await page.locator('.message-input textarea').fill('持久化测试');
    await page.locator('.send-button').click();

    // Wait for message to appear
    await expect(page.locator('.message-bubble.user').first()).toContainText('持久化测试');

    // Reload page
    await page.reload();

    // Open chat again
    await page.locator('.chat-button').click();

    // Verify message is still there
    await expect(page.locator('.message-bubble.user').first()).toContainText('持久化测试');
  });

  test('should display error state for failed messages', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/coze/chat', (route) => {
      route.abort('failed');
    });

    // Open chat and try to send message
    await page.locator('.chat-button').click();
    await page.locator('.message-input textarea').fill('错误测试');
    await page.locator('.send-button').click();

    // Verify error status on message
    const userMessage = page.locator('.message-bubble.user').first();
    await expect(userMessage.locator('.message-status.error')).toBeVisible({ timeout: 5000 });
  });

  test('should disable send button when textarea is empty', async ({ page }) => {
    // Open chat
    await page.locator('.chat-button').click();

    // Verify send button is disabled
    const sendButton = page.locator('.send-button');
    await expect(sendButton).toBeDisabled();

    // Type message
    await page.locator('.message-input textarea').fill('测试');

    // Verify send button is enabled
    await expect(sendButton).not.toBeDisabled();

    // Clear message
    await page.locator('.message-input textarea').clear();

    // Verify send button is disabled again
    await expect(sendButton).toBeDisabled();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Open chat
    await page.locator('.chat-button').click();

    // Verify chat window takes full screen
    const chatWindow = page.locator('.chat-window');
    const boundingBox = await chatWindow.boundingBox();
    
    expect(boundingBox?.width).toBeCloseTo(375, 1);
    expect(boundingBox?.height).toBeCloseTo(667, 1);
  });

  test('should auto-scroll to latest message', async ({ page }) => {
    // Open chat
    await page.locator('.chat-button').click();

    // Send multiple messages
    for (let i = 1; i <= 5; i++) {
      await page.locator('.message-input textarea').fill(`消息 ${i}`);
      await page.locator('.send-button').click();
      await page.waitForTimeout(500); // Wait between messages
    }

    // Verify last message is visible
    const lastMessage = page.locator('.message-bubble.user').last();
    await expect(lastMessage).toBeVisible();
    await expect(lastMessage).toContainText('消息 5');
  });
});

test.describe('Chatbot Admin Integration', () => {
  test('should only show widget when chatbot is enabled', async ({ page }) => {
    // This test requires setting up env variables
    // Skip if chatbot is not configured
    await page.goto('/');
    
    const chatButton = page.locator('.chat-button');
    
    // If chatbot is enabled, button should be visible
    // If not, button should not exist
    const isEnabled = process.env.CHATBOT_ENABLED === 'true';
    
    if (isEnabled) {
      await expect(chatButton).toBeVisible({ timeout: 10000 });
    } else {
      await expect(chatButton).not.toBeVisible();
    }
  });
});

test.describe('Chatbot Performance', () => {
  test('should load widget within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.locator('.chat-button').waitFor({ state: 'visible', timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Widget should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle rapid message sending', async ({ page }) => {
    // Open chat
    await page.locator('.chat-button').click();

    // Send multiple messages rapidly
    for (let i = 1; i <= 3; i++) {
      await page.locator('.message-input textarea').fill(`快速消息 ${i}`);
      await page.locator('.send-button').click();
    }

    // Verify all messages are displayed
    const userMessages = page.locator('.message-bubble.user');
    await expect(userMessages).toHaveCount(3);
  });
});

