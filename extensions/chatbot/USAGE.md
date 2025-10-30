# Chatbot Extension - Usage Guide

## Installation

1. The extension is automatically loaded when placed in the `extensions/chatbot` directory
2. Run database migrations:
   ```bash
   npm run build
   npm run dev
   ```

3. The extension will create the necessary database tables on first run

## Configuration

### Environment Variables

Add to your `.env` file or EverShop config:

```bash
CHATBOT_BACKEND_API_URL=http://localhost:48080
CHATBOT_TENANT_ID=1
```

### Config File

Add to `config/default.json`:

```json
{
  "chatbot": {
    "enabled": true,
    "backendApiUrl": "http://localhost:48080",
    "defaultTenantId": 1,
    "defaultShopId": "evershop-default"
  }
}
```

## Usage

### 1. Access the Chatbot Menu

After installation, you'll see a new "Chatbot" menu item in the admin panel with two sub-items:
- **Dashboard**: Monitor sync status and chat statistics
- **Settings**: Configure store information and sync options

### 2. Configure Settings

1. Navigate to **Chatbot → Settings**
2. Enter your store name
3. Upload a store logo (optional)
4. Enable/disable data sync for:
   - Products
   - Orders
   - Customers
5. Click **Save Settings**

### 3. Sync Data

From the Dashboard page:
1. Click **Sync Products** to sync product catalog
2. Click **Sync Orders** to sync order history
3. Click **Sync Customers** to sync customer data

The AI bot will use this data to answer customer questions.

### 4. Monitor Status

The Dashboard shows:
- Today's conversation count
- Last sync times for each data type
- Total items synced

## API Endpoints

### Get Chatbot Status

```bash
GET /api/chatbot/status?shop_id=evershop-default
```

**Response**:
```json
{
  "success": true,
  "data": {
    "setting": {
      "shop_id": "evershop-default",
      "shop_name": "My Store",
      "sync_products": true,
      "sync_orders": true,
      "sync_customers": true
    },
    "syncInfo": {
      "productCount": 150,
      "productDate": "2025-10-27T10:00:00Z",
      "orderCount": 50,
      "orderDate": "2025-10-27T09:00:00Z"
    },
    "chatStats": {
      "todayCount": 25,
      "increasePer": 15
    }
  }
}
```

### Save Settings

```bash
POST /api/chatbot/settings
Content-Type: application/json

{
  "shop_id": "evershop-default",
  "shop_name": "My Store",
  "shop_logo_url": "https://example.com/logo.png",
  "sync_products": true,
  "sync_orders": true,
  "sync_customers": false
}
```

### Sync Data

```bash
POST /api/chatbot/sync
Content-Type: application/json

{
  "shop_id": "evershop-default",
  "sync_type": "products"
}
```

**Sync Types**: `products`, `orders`, `customers`

## GraphQL Queries

### Query Chatbot Setting

```graphql
query {
  chatbotSetting(shopId: "evershop-default") {
    shopId
    shopName
    shopLogoUrl
    syncProducts
    syncOrders
    syncCustomers
    lastSyncProducts
    lastSyncOrders
    lastSyncCustomers
  }
}
```

### Query Chatbot Status

```graphql
query {
  chatbotStatus(shopId: "evershop-default") {
    setting {
      shopName
      botId
    }
    syncInfo {
      productCount
      productDate
      orderCount
      orderDate
    }
    chatStats {
      todayCount
      increasePer
    }
  }
}
```

### Save Settings Mutation

```graphql
mutation {
  saveChatbotSetting(
    shopId: "evershop-default"
    shopName: "My Store"
    shopLogoUrl: "https://example.com/logo.png"
    syncProducts: true
    syncOrders: true
    syncCustomers: true
  ) {
    shopId
    shopName
  }
}
```

### Sync Data Mutation

```graphql
mutation {
  syncChatbotData(
    shopId: "evershop-default"
    syncType: "products"
  )
}
```

## Integration with Chatbot Admin

This extension integrates with the Chatbot Admin backend API running at `localhost:48080`.

### Required Backend API Endpoints

- `POST /admin-api/system/auth/login` - Get access token
- `POST /admin-api/mail/shopify/auth/initialization` - Initialize shop
- `POST /admin-api/mail/coze/bot/create` - Create Coze bot
- `POST /admin-api/mail/coze/manualSyncDataset` - Sync data
- `GET /admin-api/mail/coze/api/datasetStatistic/{shopId}` - Get sync status
- `GET /admin-api/mail/coze-chat-history/todayChatStatistics` - Get chat stats

### Authentication Flow

1. Extension calls login API with shop name
2. Receives access token and tenant ID
3. Caches token for subsequent requests
4. Automatically refreshes token when expired

## Troubleshooting

### "Shop not configured" error

Make sure to visit the Settings page first and save your configuration.

### Sync fails

1. Check that chatbotadmin backend is running on port 48080
2. Verify the backend API URL in settings
3. Check the sync logs in the database:
   ```sql
   SELECT * FROM chatbot_sync_log ORDER BY created_at DESC LIMIT 10;
   ```

### No menu item appears

1. Rebuild the application: `npm run build`
2. Restart the server: `npm run dev`
3. Clear browser cache

## Development

### Add New Features

Follow the EverShop extension pattern:
- Add API endpoints in `src/api/`
- Add pages in `src/pages/admin/`
- Update GraphQL schema in `src/graphql/types/`

### Testing

```bash
# View database tables
psql -d evershop -c "\d chatbot_setting"

# Check sync logs
psql -d evershop -c "SELECT * FROM chatbot_sync_log ORDER BY created_at DESC LIMIT 5;"
```

## Support

- EverShop Documentation: https://evershop.io/docs
- Chatbot Admin API: http://localhost:48080/doc.html
- Issues: Create an issue in your project repository

