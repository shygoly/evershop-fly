import { io, Socket } from 'socket.io-client';

/**
 * ChatbotSocketService - Socket.IO client for real-time chatbot communication
 *
 * Responsibilities:
 * 1. Manage Socket.IO connection to chatbot-node server
 * 2. Handle message sending and receiving
 * 3. Manage conversation rooms
 * 4. Implement auto-reconnection logic
 * 5. Provide event listeners for UI updates
 */

export interface SocketConfig {
  serverUrl: string;
  userId: string;
  userName?: string;
  role?: 'admin' | 'customer';
  token?: string;
  sessionId?: string;
}

export interface StreamMessage {
  type: 'chunk' | 'complete' | 'error';
  contentChunk?: string;
  content?: string;
  conversationId: string;
  timestamp: string;
  error?: string;
}

class ChatbotSocketService {
  private socket: Socket | null = null;
  private config: SocketConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private conversationId: string | null = null;
  private messageHandlers: Map<string, Function[]> = new Map();

  /**
   * Initialize Socket.IO connection
   */
  connect(config: SocketConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.config = config;

        const socketConfig: any = {
          reconnection: true,
          reconnectionDelayMax: 10000,
          reconnectionDelay: this.reconnectDelay,
          reconnectionAttempts: this.maxReconnectAttempts,
          transports: ['websocket', 'polling'],
          auth: {},
        };

        // Setup authentication
        if (config.token) {
          socketConfig.auth.token = config.token;
        }
        if (config.sessionId) {
          socketConfig.auth.sessionId = config.sessionId;
        }

        this.socket = io(config.serverUrl, socketConfig);

        // Handle connection success
        this.socket.on('connect', () => {
          console.log('Socket.IO connected:', this.socket?.id);
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        });

        // Handle authentication success
        this.socket.on('authenticated', (data: any) => {
          console.log('Socket.IO authenticated:', data);
          this.emit('authenticated', data);
        });

        // Handle message chunk (streaming)
        this.socket.on('message_chunk', (data: StreamMessage) => {
          this.emit('message_chunk', data);
        });

        // Handle message complete
        this.socket.on('message_complete', (data: StreamMessage) => {
          this.emit('message_complete', data);
        });

        // Handle message errors
        this.socket.on('message_error', (data: any) => {
          this.emit('message_error', data);
        });

        // Handle typing indicator
        this.socket.on('typing_indicator', (data: any) => {
          this.emit('typing_indicator', data);
        });

        // Handle message received (regular messages)
        this.socket.on('message_received', (data: any) => {
          this.emit('message_received', data);
        });

        // Handle presence updates
        this.socket.on('presence_update', (data: any) => {
          this.emit('presence_update', data);
        });

        // Handle joined conversation
        this.socket.on('joined_conversation', (data: any) => {
          this.conversationId = data.conversationId;
          this.emit('joined_conversation', data);
        });

        // Handle connection errors
        this.socket.on('error', (error: any) => {
          console.error('Socket.IO error:', error);
          this.emit('error', error);
          reject(error);
        });

        // Handle disconnection
        this.socket.on('disconnect', (reason: string) => {
          console.log('Socket.IO disconnected:', reason);
          this.emit('disconnected', { reason });
        });

        // Handle reconnection attempts
        this.socket.on('reconnect_attempt', () => {
          this.reconnectAttempts++;
          console.log(
            `Socket.IO reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
          );
          this.emit('reconnect_attempt', { attempt: this.reconnectAttempts });
        });

        // Handle reconnection failure
        this.socket.on('reconnect_failed', () => {
          console.error('Socket.IO reconnection failed');
          this.emit('reconnect_failed');
        });
      } catch (error) {
        console.error('Failed to initialize Socket.IO:', error);
        reject(error);
      }
    });
  }

  /**
   * Join conversation room
   */
  joinConversation(conversationId: string): void {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    this.conversationId = conversationId;
    this.socket.emit('join_conversation', conversationId);
  }

  /**
   * Leave conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('leave_conversation', conversationId);
  }

  /**
   * Send streaming message
   */
  sendStreamingMessage(
    conversationId: string,
    content: string,
    botId?: string
  ): void {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit(
      'send_message_stream',
      {
        conversationId,
        content,
        botId,
      },
      (response: any) => {
        if (response.success) {
          console.log('Streaming message sent successfully');
        } else {
          console.error('Failed to send streaming message:', response.error);
          this.emit('message_error', {
            conversationId,
            error: response.error,
          });
        }
      }
    );
  }

  /**
   * Send regular message
   */
  sendMessage(conversationId: string, content: string): void {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit(
      'send_message',
      {
        conversationId,
        content,
      },
      (response: any) => {
        if (!response.success) {
          console.error('Failed to send message:', response.error);
          this.emit('message_error', {
            conversationId,
            error: response.error,
          });
        }
      }
    );
  }

  /**
   * Send typing start indicator
   */
  startTyping(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit('typing_start', conversationId);
  }

  /**
   * Send typing stop indicator
   */
  stopTyping(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit('typing_stop', conversationId);
  }

  /**
   * Load chat history
   */
  loadChatHistory(
    conversationId: string,
    limit: number = 50,
    pageNo: number = 1
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(
        'get_chat_history',
        {
          conversationId,
          limit,
          pageNo,
        },
        (response: any) => {
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error || 'Failed to load chat history'));
          }
        }
      );
    });
  }

  /**
   * Register event listener
   */
  on(event: string, callback: Function): void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)!.push(callback);
  }

  /**
   * Unregister event listener
   */
  off(event: string, callback: Function): void {
    const handlers = this.messageHandlers.get(event);
    if (!handlers) return;

    const index = handlers.indexOf(callback);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Emit internal event
   */
  private emit(event: string, data?: any): void {
    const handlers = this.messageHandlers.get(event);
    if (!handlers) return;

    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.conversationId = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Get conversation ID
   */
  getConversationId(): string | null {
    return this.conversationId;
  }
}

// Export singleton instance
const chatbotSocketService = new ChatbotSocketService();
export default chatbotSocketService;
