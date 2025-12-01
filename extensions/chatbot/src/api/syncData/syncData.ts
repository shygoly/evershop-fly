// @ts-nocheck
import { Request, Response } from 'express';
import { ChatbotSettingService } from '../../services/ChatbotSettingService.js';
import { chatbotNodeClient } from '../../services/ChatbotNodeClient.js';
import { pool } from '@evershop/evershop/lib/postgres/connection.js';

/**
 * Fetch products from EverShop database
 */
async function fetchProducts() {
  const query = `
    SELECT 
      p.product_id as id,
      p.sku,
      pd.name,
      pd.description,
      p.price,
      p.status,
      p.image
    FROM product p
    LEFT JOIN product_description pd ON p.product_id = pd.product_product_id
    WHERE p.status = 1
    LIMIT 1000
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Fetch orders from EverShop database
 */
async function fetchOrders() {
  const query = `
    SELECT 
      o.order_id as id,
      o.order_number,
      o.customer_email,
      o.customer_full_name,
      o.grand_total,
      o.currency,
      o.status,
      o.created_at
    FROM "order" o
    ORDER BY o.created_at DESC
    LIMIT 1000
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Fetch customers from EverShop database
 */
async function fetchCustomers() {
  const query = `
    SELECT 
      c.customer_id as id,
      c.email,
      c.full_name,
      c.status,
      c.created_at
    FROM customer c
    WHERE c.status = 1
    LIMIT 1000
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

export default async function syncData(
  request: Request,
  response: Response,
  next: Function
) {
  try {
    const { shop_id, sync_type } = request.body;

    if (!shop_id) {
      throw new Error('Shop ID is required');
    }

    if (!sync_type || !['products', 'orders', 'customers'].includes(sync_type)) {
      throw new Error('Invalid sync type. Must be: products, orders, or customers');
    }

    // Check if chatbot is configured
    if (!chatbotNodeClient.isConfigured()) {
      throw new Error('Chatbot not properly configured. Check environment variables.');
    }

    // Get shop setting
    const setting = await ChatbotSettingService.getByShopId(shop_id);

    if (!setting) {
      throw new Error('Chatbot not configured for this shop');
    }

    // Fetch data from EverShop database based on sync type
    let data: any[] = [];
    
    switch (sync_type) {
      case 'products':
        data = await fetchProducts();
        break;
      case 'orders':
        data = await fetchOrders();
        break;
      case 'customers':
        data = await fetchCustomers();
        break;
    }

    console.log(`Syncing ${data.length} ${sync_type} to chatbot-node...`);

    // Send data to chatbot-node
    const result = await chatbotNodeClient.syncDataset(
      sync_type as 'products' | 'orders' | 'customers',
      data
    );

    if (result.success) {
      // Update last sync time
      await ChatbotSettingService.updateSyncTime(
        shop_id,
        sync_type as 'products' | 'orders' | 'customers'
      );

      // Log successful sync
      await ChatbotSettingService.logSync({
        shop_id,
        sync_type,
        status: 'success',
        item_count: result.count || data.length
      });

      response.$body = {
        data: {
          count: result.count || data.length,
          type: sync_type
        },
        success: true,
        message: `${result.count || data.length} ${sync_type} synced successfully`
      };
    } else {
      throw new Error(result.message || 'Sync operation failed');
    }

    next();
  } catch (error: any) {
    console.error('Sync data error:', error);
    
    // Log failed sync
    if (request.body.shop_id && request.body.sync_type) {
      await ChatbotSettingService.logSync({
        shop_id: request.body.shop_id,
        sync_type: request.body.sync_type,
        status: 'failed',
        error_message: error.message
      }).catch(console.error);
    }

    response.$body = {
      success: false,
      message: error.message || 'Failed to sync data'
    };
    next();
  }
}

