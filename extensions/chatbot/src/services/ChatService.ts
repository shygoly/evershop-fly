/**
 * Chat Service
 * Manages chat conversations with AI bot
 */

import { pool } from "@evershop/evershop/lib/postgres";
import { insert, select } from "@evershop/postgres-query-builder";

export interface ChatMessage {
  message_id?: number;
  conversation_id: string;
  shop_id: string;
  sender: 'user' | 'bot';
  content: string;
  created_at?: Date;
}

export interface ChatConversation {
  conversation_id: string;
  shop_id: string;
  customer_email?: string;
  customer_name?: string;
  status: 'active' | 'closed';
  created_at?: Date;
  updated_at?: Date;
}

export class ChatService {
  /**
   * Create new conversation
   */
  static async createConversation(data: {
    shop_id: string;
    customer_email?: string;
    customer_name?: string;
  }): Promise<ChatConversation> {
    const conversation = await insert('chatbot_conversation')
      .given({
        ...data,
        conversation_id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'active'
      })
      .execute(pool);

    return conversation;
  }

  /**
   * Get conversation by ID
   */
  static async getConversation(conversationId: string): Promise<ChatConversation | null> {
    const conversation = await select()
      .from('chatbot_conversation')
      .where('conversation_id', '=', conversationId)
      .load(pool);

    return conversation || null;
  }

  /**
   * Save chat message
   */
  static async saveMessage(data: ChatMessage): Promise<ChatMessage> {
    const message = await insert('chatbot_message')
      .given(data)
      .execute(pool);

    return message;
  }

  /**
   * Get conversation messages
   */
  static async getMessages(conversationId: string, limit: number = 50): Promise<ChatMessage[]> {
    const messages = await select()
      .from('chatbot_message')
      .where('conversation_id', '=', conversationId)
      .orderBy('created_at', 'ASC')
      .limit(0, limit)
      .execute(pool);

    return messages;
  }

  /**
   * Get or create conversation for customer
   */
  static async getOrCreateConversation(data: {
    shop_id: string;
    customer_email?: string;
  }): Promise<ChatConversation> {
    // Try to find active conversation
    let conversation = await select()
      .from('chatbot_conversation')
      .where('shop_id', '=', data.shop_id)
      .andWhere('status', '=', 'active')
      .andWhere('customer_email', '=', data.customer_email || '')
      .orderBy('created_at', 'DESC')
      .load(pool);

    if (!conversation) {
      conversation = await this.createConversation(data);
    }

    return conversation;
  }

  /**
   * Close conversation
   */
  static async closeConversation(conversationId: string): Promise<void> {
    await pool.query(
      'UPDATE chatbot_conversation SET status = $1, updated_at = NOW() WHERE conversation_id = $2',
      ['closed', conversationId]
    );
  }
}

