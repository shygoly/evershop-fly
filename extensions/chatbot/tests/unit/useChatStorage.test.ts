/**
 * Unit tests for useChatStorage Hook
 */

import { renderHook, act } from '@testing-library/react';
import { useChatStorage } from '../../src/hooks/useChatStorage';
import type { Message } from '../../src/types/chat';

describe('useChatStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('should generate and persist session ID', () => {
    const { result } = renderHook(() => useChatStorage());
    
    const sessionId1 = result.current.getSessionId();
    expect(sessionId1).toMatch(/^session_\d+_[a-z0-9]+$/);
    
    // Should return same session ID on subsequent calls
    const sessionId2 = result.current.getSessionId();
    expect(sessionId2).toBe(sessionId1);
  });

  test('should save and load messages', () => {
    const { result } = renderHook(() => useChatStorage());
    
    const testMessages: Message[] = [
      {
        id: 'msg1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      },
      {
        id: 'msg2',
        role: 'assistant',
        content: 'Hi there!',
        timestamp: new Date(),
      },
    ];

    // Save messages
    act(() => {
      result.current.saveMessages(testMessages);
    });

    // Load messages
    const loadedMessages = result.current.loadMessages();
    
    expect(loadedMessages).toHaveLength(2);
    expect(loadedMessages[0].content).toBe('Hello');
    expect(loadedMessages[1].content).toBe('Hi there!');
  });

  test('should limit cached messages to 100', () => {
    const { result } = renderHook(() => useChatStorage());
    
    // Create 150 messages
    const messages: Message[] = Array.from({ length: 150 }, (_, i) => ({
      id: `msg${i}`,
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`,
      timestamp: new Date(),
    }));

    // Save all messages
    act(() => {
      result.current.saveMessages(messages);
    });

    // Load messages
    const loadedMessages = result.current.loadMessages();
    
    // Should only have last 100 messages
    expect(loadedMessages).toHaveLength(100);
    expect(loadedMessages[0].content).toBe('Message 50');
    expect(loadedMessages[99].content).toBe('Message 149');
  });

  test('should clear messages older than 24 hours', () => {
    const { result } = renderHook(() => useChatStorage());
    
    // Save messages with old timestamp
    const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    
    const storageData = {
      messages: [
        {
          id: 'msg1',
          role: 'user',
          content: 'Old message',
          timestamp: new Date(oldTimestamp),
        },
      ],
      timestamp: oldTimestamp,
    };
    
    localStorage.setItem('chatbot_messages', JSON.stringify(storageData));

    // Try to load - should return empty array
    const loadedMessages = result.current.loadMessages();
    expect(loadedMessages).toHaveLength(0);
    
    // Verify localStorage was cleared
    expect(localStorage.getItem('chatbot_messages')).toBeNull();
  });

  test('should clear history', () => {
    const { result } = renderHook(() => useChatStorage());
    
    // Save some data
    act(() => {
      result.current.saveMessages([
        {
          id: 'msg1',
          role: 'user',
          content: 'Test',
          timestamp: new Date(),
        },
      ]);
    });
    
    // Verify data exists
    expect(localStorage.getItem('chatbot_messages')).not.toBeNull();
    expect(localStorage.getItem('chatbot_session_id')).not.toBeNull();

    // Clear history
    act(() => {
      result.current.clearHistory();
    });

    // Verify localStorage is cleared
    expect(localStorage.getItem('chatbot_messages')).toBeNull();
    expect(localStorage.getItem('chatbot_session_id')).toBeNull();
  });

  test('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = jest.fn(() => {
      throw new Error('QuotaExceededError');
    });

    const { result } = renderHook(() => useChatStorage());
    
    // Should not throw error
    expect(() => {
      result.current.saveMessages([
        {
          id: 'msg1',
          role: 'user',
          content: 'Test',
          timestamp: new Date(),
        },
      ]);
    }).not.toThrow();

    // Restore original
    Storage.prototype.setItem = originalSetItem;
  });
});

