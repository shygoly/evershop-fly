/**
 * useSSEStream Hook
 * Manages Server-Sent Events (SSE) streaming connection
 */

import { useRef, useCallback, useEffect } from 'react';
import type { UseSSEStreamOptions } from '../types/chat';

export const useSSEStream = ({
  url,
  onMessage,
  onError,
  onComplete,
}: UseSSEStreamOptions) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  /**
   * Connect to SSE endpoint
   */
  const connect = useCallback(() => {
    // Don't reconnect if we've exceeded max attempts
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('Max SSE reconnection attempts reached');
      onError(new Error('Maximum reconnection attempts exceeded'));
      return;
    }

    try {
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log('SSE connection established');
        reconnectAttemptsRef.current = 0; // Reset on successful connection
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);

          // Check if streaming is complete
          if (data.type === 'done' || data.type === 'complete') {
            eventSource.close();
            onComplete?.();
          }
        } catch (error) {
          console.error('Failed to parse SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();

        // Increment reconnect attempts
        reconnectAttemptsRef.current += 1;

        // Schedule reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          onError(new Error('SSE connection failed after multiple attempts'));
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      onError(error as Error);
    }
  }, [url, onMessage, onError, onComplete]);

  /**
   * Close SSE connection
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    reconnectAttemptsRef.current = 0;
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
  };
};


