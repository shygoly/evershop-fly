/**
 * Chatbot Setting Service
 * Manages chatbot configuration in local database
 */

import { pool } from "@evershop/evershop/lib/postgres";
import { insert, select, update } from "@evershop/postgres-query-builder";

export interface ChatbotSetting {
  setting_id?: number;
  uuid?: string;
  shop_id: string;
  shop_name?: string;
  shop_logo_url?: string;
  bot_id?: string;
  sync_products?: boolean;
  sync_orders?: boolean;
  sync_customers?: boolean;
  backend_api_url?: string;
  tenant_id?: number;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
  last_sync_products?: Date;
  last_sync_orders?: Date;
  last_sync_customers?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export class ChatbotSettingService {
  /**
   * Get chatbot setting by shop ID
   */
  static async getByShopId(shopId: string): Promise<ChatbotSetting | null> {
    const setting = await select()
      .from('chatbot_setting')
      .where('shop_id', '=', shopId)
      .load(pool);

    return setting || null;
  }

  /**
   * Create new chatbot setting
   */
  static async create(data: Partial<ChatbotSetting>): Promise<ChatbotSetting> {
    const setting = await insert('chatbot_setting')
      .given(data)
      .execute(pool);

    return setting;
  }

  /**
   * Update chatbot setting
   */
  static async update(shopId: string, data: Partial<ChatbotSetting>): Promise<ChatbotSetting> {
    const setting = await update('chatbot_setting')
      .given({ ...data, updated_at: new Date() })
      .where('shop_id', '=', shopId)
      .execute(pool);

    return setting;
  }

  /**
   * Create or update chatbot setting
   */
  static async upsert(shopId: string, data: Partial<ChatbotSetting>): Promise<ChatbotSetting> {
    const existing = await this.getByShopId(shopId);
    
    if (existing) {
      return this.update(shopId, data);
    } else {
      return this.create({ ...data, shop_id: shopId });
    }
  }

  /**
   * Update last sync time for a specific type
   */
  static async updateSyncTime(
    shopId: string,
    syncType: 'products' | 'orders' | 'customers'
  ): Promise<void> {
    const field = `last_sync_${syncType}`;
    await update('chatbot_setting')
      .given({ [field]: new Date(), updated_at: new Date() })
      .where('shop_id', '=', shopId)
      .execute(pool);
  }

  /**
   * Log sync operation
   */
  static async logSync(data: {
    shop_id: string;
    sync_type: string;
    status: 'success' | 'failed';
    item_count?: number;
    error_message?: string;
  }): Promise<void> {
    await insert('chatbot_sync_log')
      .given(data)
      .execute(pool);
  }

  /**
   * Get recent sync logs
   */
  static async getRecentSyncLogs(shopId: string, limit: number = 10): Promise<any[]> {
    const logs = await select()
      .from('chatbot_sync_log')
      .where('shop_id', '=', shopId)
      .orderBy('created_at', 'DESC')
      .limit(0, limit)
      .execute(pool);

    return logs;
  }
}

