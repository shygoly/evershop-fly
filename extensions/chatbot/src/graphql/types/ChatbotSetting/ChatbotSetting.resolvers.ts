import { ChatbotSettingService } from "../../../services/ChatbotSettingService.js";
import { chatbotApiClient } from "../../../services/ChatbotApiClient.js";

export default {
  Query: {
    chatbotSetting: async (_, { shopId }) => {
      const setting = await ChatbotSettingService.getByShopId(shopId);
      if (!setting) {
        return null;
      }

      return {
        settingId: setting.setting_id,
        uuid: setting.uuid,
        shopId: setting.shop_id,
        shopName: setting.shop_name,
        shopLogoUrl: setting.shop_logo_url,
        botId: setting.bot_id,
        syncProducts: setting.sync_products,
        syncOrders: setting.sync_orders,
        syncCustomers: setting.sync_customers,
        backendApiUrl: setting.backend_api_url,
        tenantId: setting.tenant_id,
        lastSyncProducts: setting.last_sync_products?.toISOString(),
        lastSyncOrders: setting.last_sync_orders?.toISOString(),
        lastSyncCustomers: setting.last_sync_customers?.toISOString(),
        createdAt: setting.created_at?.toISOString(),
        updatedAt: setting.updated_at?.toISOString(),
      };
    },

    chatbotStatus: async (_, { shopId }) => {
      const setting = await ChatbotSettingService.getByShopId(shopId);
      
      if (!setting) {
        return null;
      }

      const shopInfo = {
        id: shopId,
        name: setting.shop_name || shopId,
      };

      const [syncInfo, chatStats] = await Promise.all([
        chatbotApiClient.getSyncInfo(shopInfo),
        chatbotApiClient.getChatNumberToday(shopInfo),
      ]);

      return {
        setting: {
          settingId: setting.setting_id,
          uuid: setting.uuid,
          shopId: setting.shop_id,
          shopName: setting.shop_name,
          shopLogoUrl: setting.shop_logo_url,
          botId: setting.bot_id,
          syncProducts: setting.sync_products,
          syncOrders: setting.sync_orders,
          syncCustomers: setting.sync_customers,
          backendApiUrl: setting.backend_api_url,
          tenantId: setting.tenant_id,
          lastSyncProducts: setting.last_sync_products?.toISOString(),
          lastSyncOrders: setting.last_sync_orders?.toISOString(),
          lastSyncCustomers: setting.last_sync_customers?.toISOString(),
          createdAt: setting.created_at?.toISOString(),
          updatedAt: setting.updated_at?.toISOString(),
        },
        syncInfo: syncInfo || {
          productCount: 0,
          productDate: null,
          orderCount: 0,
          orderDate: null,
          customerCount: 0,
          customerDate: null,
        },
        chatStats: chatStats || {
          todayCount: 0,
          increasePer: 0,
        },
      };
    },
  },

  Mutation: {
    saveChatbotSetting: async (_, args) => {
      const { shopId, ...settingData } = args;

      const setting = await ChatbotSettingService.upsert(shopId, {
        shop_name: settingData.shopName,
        shop_logo_url: settingData.shopLogoUrl,
        sync_products: settingData.syncProducts,
        sync_orders: settingData.syncOrders,
        sync_customers: settingData.syncCustomers,
      });

      return {
        settingId: setting.setting_id,
        uuid: setting.uuid,
        shopId: setting.shop_id,
        shopName: setting.shop_name,
        shopLogoUrl: setting.shop_logo_url,
        botId: setting.bot_id,
        syncProducts: setting.sync_products,
        syncOrders: setting.sync_orders,
        syncCustomers: setting.sync_customers,
        backendApiUrl: setting.backend_api_url,
        tenantId: setting.tenant_id,
        lastSyncProducts: setting.last_sync_products?.toISOString(),
        lastSyncOrders: setting.last_sync_orders?.toISOString(),
        lastSyncCustomers: setting.last_sync_customers?.toISOString(),
        createdAt: setting.created_at?.toISOString(),
        updatedAt: setting.updated_at?.toISOString(),
      };
    },

    syncChatbotData: async (_, { shopId, syncType }) => {
      const setting = await ChatbotSettingService.getByShopId(shopId);

      if (!setting) {
        throw new Error("Chatbot not configured for this shop");
      }

      const shopInfo = {
        id: shopId,
        name: setting.shop_name || shopId,
      };

      const dateTypeMap: Record<string, string> = {
        products: "1",
        orders: "2",
        customers: "3",
      };

      const dateType = dateTypeMap[syncType];
      if (!dateType) {
        throw new Error("Invalid sync type");
      }

      const result = await chatbotApiClient.manualSyncDataset(shopInfo, dateType);

      if (result) {
        await ChatbotSettingService.updateSyncTime(
          shopId,
          syncType as "products" | "orders" | "customers"
        );

        await ChatbotSettingService.logSync({
          shop_id: shopId,
          sync_type: syncType,
          status: "success",
        });

        return true;
      }

      await ChatbotSettingService.logSync({
        shop_id: shopId,
        sync_type: syncType,
        status: "failed",
        error_message: "Sync operation returned null",
      });

      return false;
    },
  },
};

