/**
 * Chat Widget Type Definitions
 */

// User roles for permission control
export type UserRole = 'visitor' | 'customer';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  sessionId: string;
}

export interface ChatStorage {
  sessionId: string;
  messages: Message[];
  timestamp: number;
}

export interface SSEState {
  isConnected: boolean;
  isStreaming: boolean;
  error: string | null;
}

export interface ChatWidgetProps {
  shopId: string;
  botId: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  userRole?: UserRole;
}

export interface UseChatbotOptions {
  shopId: string;
  botId: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  userRole?: UserRole;
}

export interface UseChatbotReturn {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  toggleChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  resetChat: () => void;
}

export interface UseSSEStreamOptions {
  url: string;
  onMessage: (data: any) => void;
  onError: (error: Error) => void;
  onComplete?: () => void;
}

export interface UseChatStorageReturn {
  saveMessages: (messages: Message[]) => void;
  loadMessages: () => Message[];
  getSessionId: () => string;
  clearHistory: () => void;
}


