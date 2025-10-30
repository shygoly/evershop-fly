# Chatbot Extension - Integration Guide

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   EverShop      │         │  Chatbot Admin   │         │   Coze API      │
│   (Frontend)    │────────▶│   (Backend)      │────────▶│   (AI Service)  │
│                 │         │  Port: 48080     │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
       │                            │
       │                            │
       ▼                            ▼
┌─────────────────┐         ┌──────────────────┐
│  PostgreSQL     │         │   PostgreSQL     │
│  (EverShop DB)  │         │ (Chatbot Admin)  │
└─────────────────┘         └──────────────────┘
```

## Data Flow

### 1. Initial Setup Flow

```
User visits Settings Page
  ↓
EverShop creates shop_id (based on store config)
  ↓
Extension calls chatbotadmin /initialization
  ↓
Chatbotadmin creates:
  - User account
  - Coze Bot
  - Returns tenant_id and access_token
  ↓
Extension saves to local DB (chatbot_setting table)
```

### 2. Data Sync Flow

```
User clicks "Sync Products" button
  ↓
Extension queries EverShop products (via GraphQL)
  ↓
Extension calls chatbotadmin /manualSyncDataset
  ↓
Chatbotadmin:
  - Fetches data from EverShop
  - Converts to knowledge base format
  - Uploads to Coze API
  ↓
Extension updates last_sync_products timestamp
  ↓
Dashboard displays updated sync status
```

### 3. Status Query Flow

```
Dashboard page loads
  ↓
Extension calls /api/chatbot/status
  ↓
API calls chatbotadmin endpoints:
  - /datasetStatistic/{shopId} (sync counts)
  - /todayChatStatistics (chat stats)
  ↓
Dashboard displays results
```

## Key Components

### Backend Services

1. **ChatbotApiClient** (`src/services/ChatbotApiClient.ts`)
   - Manages authentication with chatbotadmin
   - Caches access tokens
   - Provides typed methods for all API calls
   - Handles errors and retries

2. **ChatbotSettingService** (`src/services/ChatbotSettingService.ts`)
   - CRUD operations for chatbot_setting table
   - Manages sync timestamps
   - Logs sync operations

3. **TokenCache** (`src/services/TokenCache.ts`)
   - In-memory token storage
   - Token expiry checking
   - Auto-refresh logic

### API Endpoints

1. **POST /api/chatbot/settings**
   - Saves chatbot configuration
   - Creates/updates chatbot_setting record
   - Returns saved settings

2. **GET /api/chatbot/status**
   - Retrieves current sync status
   - Fetches data from chatbotadmin
   - Returns combined status object

3. **POST /api/chatbot/sync**
   - Triggers data synchronization
   - Calls chatbotadmin sync endpoint
   - Logs sync operation
   - Updates sync timestamp

### Frontend Pages

1. **Dashboard** (`src/pages/admin/chatbotDashboard/`)
   - Displays sync statistics
   - Shows chat conversation counts
   - Provides quick sync buttons
   - Real-time status updates

2. **Settings** (`src/pages/admin/chatbotSettings/`)
   - Store branding configuration
   - Data sync preferences
   - Logo upload
   - API URL configuration

### Menu Registration

**ChatbotMenuGroup** (`src/pages/admin/all/ChatbotMenuGroup.jsx`)
- Registers menu items in admin navigation
- Uses Heroicons for icons
- sortOrder: 50 (appears after Catalog menu)

## Database Schema

### chatbot_setting Table

| Column | Type | Description |
|--------|------|-------------|
| setting_id | INT | Primary key |
| uuid | UUID | Unique identifier |
| shop_id | VARCHAR(255) | Store identifier (unique) |
| shop_name | VARCHAR(255) | Display name |
| shop_logo_url | TEXT | Logo image URL |
| bot_id | VARCHAR(255) | Coze bot ID |
| sync_products | BOOLEAN | Enable product sync |
| sync_orders | BOOLEAN | Enable order sync |
| sync_customers | BOOLEAN | Enable customer sync |
| backend_api_url | VARCHAR(500) | Chatbotadmin API URL |
| tenant_id | INT | Chatbotadmin tenant ID |
| access_token | TEXT | Cached access token |
| refresh_token | TEXT | Token refresh |
| token_expires_at | TIMESTAMP | Token expiry |
| last_sync_products | TIMESTAMP | Last product sync |
| last_sync_orders | TIMESTAMP | Last order sync |
| last_sync_customers | TIMESTAMP | Last customer sync |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### chatbot_sync_log Table

| Column | Type | Description |
|--------|------|-------------|
| log_id | INT | Primary key |
| uuid | UUID | Unique identifier |
| shop_id | VARCHAR(255) | Store identifier |
| sync_type | VARCHAR(50) | products/orders/customers |
| status | VARCHAR(50) | success/failed |
| item_count | INT | Items synced |
| error_message | TEXT | Error details |
| created_at | TIMESTAMP | Log timestamp |

## API Integration Details

### Chatbotadmin API Endpoints Used

1. **Authentication**
   ```
   POST /admin-api/mail/shopify/auth/login
   Body: { shopName: "evershop-default" }
   Returns: { accessToken, tenantId, expiresTime }
   ```

2. **Shop Initialization**
   ```
   POST /admin-api/mail/shopify/auth/initialization
   Body: { shop: "evershop-default", ... }
   Returns: Shop info
   ```

3. **Create Bot**
   ```
   POST /admin-api/mail/coze/bot/create
   Body: { name, description, promptInfo }
   Returns: { botId }
   ```

4. **Manual Sync**
   ```
   POST /admin-api/mail/coze/manualSyncDataset?dateType=1
   dateType: 1=products, 2=orders, 3=customers
   ```

5. **Get Sync Status**
   ```
   GET /admin-api/mail/coze/api/datasetStatistic/{shopId}
   Returns: { productCount, productDate, ... }
   ```

6. **Get Chat Stats**
   ```
   GET /admin-api/mail/coze-chat-history/todayChatStatistics
   Returns: { todayCount, increasePer }
   ```

### Headers Required

All API calls to chatbotadmin must include:
```
Content-Type: application/json
tenant-id: <tenant_id>
Authorization: Bearer <access_token>
```

## Customization

### Change Shop ID Logic

Edit `ChatbotSettingService.ts` to customize how shop_id is determined:

```typescript
// Example: Use store URL as shop_id
const shopId = `evershop-${request.hostname}`;
```

### Custom Bot Prompt

Modify the bot creation in `ChatbotApiClient.ts`:

```typescript
const botData = {
  name: shopInfo.name,
  description: 'Custom bot description',
  promptInfo: 'Your custom prompt here...'
};
```

### Add More Sync Types

1. Add new sync option to Settings page
2. Update database migration with new column
3. Add new sync_type case in syncData API
4. Update GraphQL schema

## Deployment Checklist

- [ ] Configure backend API URL in production config
- [ ] Set correct tenant ID
- [ ] Run database migrations
- [ ] Test all sync operations
- [ ] Verify menu items appear
- [ ] Test Settings save/load
- [ ] Verify Dashboard displays correctly
- [ ] Check API authentication works
- [ ] Test file upload for logo
- [ ] Monitor sync logs for errors

## Performance Considerations

- Token caching reduces API calls
- Sync operations are asynchronous
- Use database indexes for faster queries
- Consider rate limiting for sync operations
- Monitor chatbot_sync_log table size

## Security Notes

- Access tokens are cached in memory (cleared on restart)
- Tokens auto-refresh before expiry
- All admin endpoints require authentication
- API URLs should be environment-specific
- Never commit tokens or secrets to git

## Future Enhancements

- [ ] Real-time conversation interface
- [ ] Webhook support for instant data updates
- [ ] Bulk sync scheduling (cron jobs)
- [ ] Analytics dashboard
- [ ] Multi-language bot configuration
- [ ] A/B testing for bot responses
- [ ] Customer feedback collection

## Resources

- EverShop Extensions: https://evershop.io/docs/development/extensions
- Chatbot Admin API: http://localhost:48080/doc.html
- Coze API Docs: https://www.coze.com/docs

