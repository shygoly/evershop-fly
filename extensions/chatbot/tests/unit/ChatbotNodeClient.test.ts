/**
 * Unit tests for ChatbotNodeClient
 */

import { ChatbotNodeClient } from '../../src/services/ChatbotNodeClient';
import jwt from 'jsonwebtoken';

// Mock environment variables
const mockEnv = {
  CHATBOT_NODE_URL: 'http://localhost:3000',
  CHATBOT_SHOP_ID: 'shop-123',
  CHATBOT_SSO_SECRET: 'test-secret-key',
  CHATBOT_WEBHOOK_SECRET: 'test-webhook-secret',
};

describe('ChatbotNodeClient', () => {
  let client: ChatbotNodeClient;
  
  beforeEach(() => {
    // Set up environment
    process.env.CHATBOT_NODE_URL = mockEnv.CHATBOT_NODE_URL;
    process.env.CHATBOT_SHOP_ID = mockEnv.CHATBOT_SHOP_ID;
    process.env.CHATBOT_SSO_SECRET = mockEnv.CHATBOT_SSO_SECRET;
    process.env.CHATBOT_WEBHOOK_SECRET = mockEnv.CHATBOT_WEBHOOK_SECRET;
    
    client = new ChatbotNodeClient();
  });

  afterEach(() => {
    // Clean up
    delete process.env.CHATBOT_NODE_URL;
    delete process.env.CHATBOT_SHOP_ID;
    delete process.env.CHATBOT_SSO_SECRET;
    delete process.env.CHATBOT_WEBHOOK_SECRET;
  });

  describe('Configuration', () => {
    test('should load configuration from environment variables', () => {
      expect(client.getBaseURL()).toBe(mockEnv.CHATBOT_NODE_URL);
      expect(client.getShopId()).toBe(mockEnv.CHATBOT_SHOP_ID);
      expect(client.isConfigured()).toBe(true);
    });

    test('should detect missing configuration', () => {
      delete process.env.CHATBOT_SHOP_ID;
      const unconfiguredClient = new ChatbotNodeClient();
      
      expect(unconfiguredClient.isConfigured()).toBe(false);
    });
  });

  describe('JWT Generation', () => {
    test('should generate valid JWT token', () => {
      // Access private method via reflection (for testing)
      const token = (client as any).generateJWT();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token structure
      const decoded = jwt.verify(token, mockEnv.CHATBOT_SSO_SECRET) as any;
      
      expect(decoded.shopId).toBe(mockEnv.CHATBOT_SHOP_ID);
      expect(decoded.role).toBe('admin');
      expect(decoded.iss).toBe('shopsaas');
      expect(decoded.aud).toBe('chatbot-node');
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });

    test('should generate token with 1 hour expiry', () => {
      const token = (client as any).generateJWT();
      const decoded = jwt.verify(token, mockEnv.CHATBOT_SSO_SECRET) as any;
      
      const now = Date.now() / 1000;
      const expiry = decoded.exp;
      
      // Should expire in approximately 1 hour (3600 seconds)
      expect(expiry - now).toBeGreaterThan(3590);
      expect(expiry - now).toBeLessThan(3610);
    });

    test('should throw error when SSO secret is missing', () => {
      delete process.env.CHATBOT_SSO_SECRET;
      const clientWithoutSecret = new ChatbotNodeClient();
      
      expect(() => {
        (clientWithoutSecret as any).generateJWT();
      }).toThrow('SSO secret not configured');
    });
  });

  describe('Webhook Signature Verification', () => {
    test('should verify valid webhook signature', () => {
      const payload = JSON.stringify({ event: 'test', data: { foo: 'bar' } });
      
      // Generate signature
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', mockEnv.CHATBOT_WEBHOOK_SECRET);
      hmac.update(payload);
      const signature = hmac.digest('hex');
      
      // Verify
      const isValid = client.verifyWebhookSignature(payload, signature);
      expect(isValid).toBe(true);
    });

    test('should reject invalid webhook signature', () => {
      const payload = JSON.stringify({ event: 'test' });
      const invalidSignature = 'invalid_signature_here';
      
      const isValid = client.verifyWebhookSignature(payload, invalidSignature);
      expect(isValid).toBe(false);
    });

    test('should reject signature with tampered payload', () => {
      const originalPayload = JSON.stringify({ event: 'test', data: 'original' });
      const tamperedPayload = JSON.stringify({ event: 'test', data: 'tampered' });
      
      // Generate signature for original
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', mockEnv.CHATBOT_WEBHOOK_SECRET);
      hmac.update(originalPayload);
      const signature = hmac.digest('hex');
      
      // Verify with tampered payload - should fail
      const isValid = client.verifyWebhookSignature(tamperedPayload, signature);
      expect(isValid).toBe(false);
    });
  });

  describe('API Methods', () => {
    test('getTenantConfig should make authenticated request', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          shopId: 'shop-123',
          name: 'Test Shop',
          botId: 'bot-456',
        }),
      });

      const config = await client.getTenantConfig();
      
      expect(config).toBeDefined();
      expect(config?.shopId).toBe('shop-123');
      
      // Verify fetch was called with correct headers
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/tenants/shop-123/config'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Bearer /),
          }),
        })
      );
    });

    test('syncDataset should send data to API', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          count: 10,
        }),
      });

      const testData = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
      ];

      const result = await client.syncDataset('products', testData);
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(10);
      
      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/coze/bot/updateDataset/products'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            shopId: 'shop-123',
            type: 'products',
            data: testData,
          }),
        })
      );
    });

    test('getChatStats should return statistics', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          todayCount: 42,
          yesterdayCount: 38,
          increasePer: 10.5,
        }),
      });

      const stats = await client.getChatStats();
      
      expect(stats).toBeDefined();
      expect(stats?.todayCount).toBe(42);
    });

    test('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: 'Server error',
        }),
      });

      const config = await client.getTenantConfig();
      
      expect(config).toBeNull();
    });

    test('should handle network errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const config = await client.getTenantConfig();
      
      expect(config).toBeNull();
    });
  });

  describe('sendChatMessage', () => {
    test('should handle streaming response', async () => {
      const chunks: string[] = [];
      let completed = false;
      let errorOccurred = false;

      // Mock streaming response
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"type":"chunk","content":"Hello"}\n\n'));
          controller.enqueue(new TextEncoder().encode('data: {"type":"chunk","content":" there"}\n\n'));
          controller.enqueue(new TextEncoder().encode('data: {"type":"done"}\n\n'));
          controller.close();
        },
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        body: mockStream,
      });

      await client.sendChatMessage(
        'Test message',
        'user-123',
        (chunk) => chunks.push(chunk),
        () => { completed = true; },
        () => { errorOccurred = true; }
      );

      expect(chunks).toEqual(['Hello', ' there']);
      expect(completed).toBe(true);
      expect(errorOccurred).toBe(false);
    });

    test('should handle streaming errors', async () => {
      let errorMessage = '';

      global.fetch = jest.fn().mockRejectedValue(new Error('Connection failed'));

      await client.sendChatMessage(
        'Test',
        'user-123',
        () => {},
        () => {},
        (error) => { errorMessage = error.message; }
      );

      expect(errorMessage).toContain('Connection failed');
    });
  });
});

