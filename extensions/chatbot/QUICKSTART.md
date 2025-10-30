# Chatbot Extension - Quick Start Guide

## Prerequisites

1. ✅ EverShop installed and running
2. ✅ Chatbot Admin backend running on port 48080
3. ✅ PostgreSQL database accessible

## 5-Minute Setup

### Step 1: Verify Backend is Running

```bash
curl http://localhost:48080/v3/api-docs
```

You should see API documentation. If not, start the chatbotadmin backend first.

### Step 2: Install Extension

The extension is already in place at `extensions/chatbot/`. Just build and restart:

```bash
cd /Users/mac/projects/ecommerce/evershop-src
npm run build
npm run dev
```

### Step 3: Access Admin Panel

1. Open your browser to EverShop admin (usually `http://localhost:3000/admin`)
2. Log in with your admin credentials
3. Look for **"Chatbot"** in the left sidebar menu

### Step 4: Configure Settings

1. Click **Chatbot → Settings**
2. Fill in:
   - **Store Name**: Your store name (e.g., "My Awesome Store")
   - **Store Logo**: Upload your logo (optional)
   - **Sync Options**: Check which data to sync:
     - ✅ Products (recommended)
     - ✅ Orders (recommended)
     - ✅ Customers (recommended)
3. Click **Save Settings**

### Step 5: Sync Data

1. Click **Chatbot → Dashboard**
2. Click sync buttons:
   - **Sync Products** - syncs product catalog
   - **Sync Orders** - syncs order history
   - **Sync Customers** - syncs customer data
3. Wait for sync to complete (you'll see a success message)

### Step 6: Verify

Check the Dashboard to see:
- ✅ Product count and last sync time
- ✅ Order count and last sync time
- ✅ Customer count and last sync time
- ✅ Today's conversation count

## What Happens Behind the Scenes

1. **On First Settings Save**:
   - Extension calls chatbotadmin to initialize your store
   - A Coze AI bot is created for your store
   - Access token is cached for future API calls

2. **On Data Sync**:
   - EverShop queries your products/orders/customers
   - Data is sent to chatbotadmin
   - Chatbotadmin uploads to Coze knowledge base
   - Sync timestamp is updated

3. **AI Bot Usage**:
   - Customers can now chat with the AI bot
   - Bot answers questions using your synced data
   - Conversations are tracked and counted

## Testing the Integration

### Test API Connectivity

```bash
# Get chatbot status
curl -X GET "http://localhost:3000/api/chatbot/status?shop_id=evershop-default"

# Expected response:
# {
#   "success": true,
#   "data": {
#     "setting": { ... },
#     "syncInfo": { ... },
#     "chatStats": { ... }
#   }
# }
```

### Test Data Sync

```bash
# Sync products
curl -X POST "http://localhost:3000/api/chatbot/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "shop_id": "evershop-default",
    "sync_type": "products"
  }'
```

### Check Database

```bash
# Connect to EverShop database
psql -d evershop

# View chatbot settings
SELECT * FROM chatbot_setting;

# View sync logs
SELECT * FROM chatbot_sync_log ORDER BY created_at DESC LIMIT 5;
```

## Common Issues

### ❌ "Menu not appearing"

**Solution**:
```bash
npm run build  # Rebuild the application
# Restart the dev server
# Clear browser cache
```

### ❌ "Backend API not reachable"

**Solution**:
- Check chatbotadmin is running: `curl http://localhost:48080/v3/api-docs`
- Verify `backend_api_url` in Settings page
- Check network connectivity

### ❌ "Sync fails with 401 Unauthorized"

**Solution**:
- Go to Settings and re-save configuration
- This will refresh the access token
- Try sync again

### ❌ "Shop not configured" error

**Solution**:
- Visit Settings page first
- Save your store configuration
- Then go to Dashboard to sync

## Next Steps

### Customize Bot Behavior

The AI bot uses a default prompt. To customize:

1. Edit `src/services/ChatbotApiClient.ts`
2. Modify the `createBot` method
3. Update the `promptInfo` parameter with your custom prompt

Example:
```typescript
const botData = {
  name: shopInfo.name,
  description: 'My custom bot',
  promptInfo: `
# Role
You are a professional customer service representative for ${shopInfo.name}.

## Skills
1. Answer product questions using the knowledge base
2. Provide order status information
3. Handle customer inquiries professionally

## Constraints
- Always be polite and professional
- Only answer questions related to our store
- Use the knowledge base for accurate information
  `
};
```

### Add Custom Sync Types

To add a new sync type (e.g., "reviews"):

1. Update migration to add `sync_reviews` and `last_sync_reviews` columns
2. Add checkbox in Settings page
3. Add sync button in Dashboard
4. Update `syncData.ts` API to handle "reviews" type
5. Implement data fetch logic

### Monitor Performance

```sql
-- Check sync frequency
SELECT 
  sync_type,
  COUNT(*) as total_syncs,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM chatbot_sync_log
GROUP BY sync_type;

-- Recent sync performance
SELECT 
  sync_type,
  status,
  item_count,
  created_at
FROM chatbot_sync_log
ORDER BY created_at DESC
LIMIT 20;
```

## Production Deployment

### Update Configuration

1. Change `backend_api_url` to production URL
2. Set environment variables:
   ```bash
   CHATBOT_BACKEND_API_URL=https://your-prod-api.com
   CHATBOT_TENANT_ID=your-tenant-id
   ```

3. Update config file:
   ```json
   {
     "chatbot": {
       "enabled": true,
       "backendApiUrl": "https://your-prod-api.com",
       "defaultTenantId": 1
     }
   }
   ```

### Build and Deploy

```bash
# Build application
npm run build

# Start production server
NODE_ENV=production npm start
```

### Monitor Logs

```bash
# Check application logs
tail -f logs/evershop.log | grep chatbot

# Check sync errors
psql -d evershop -c "
  SELECT * FROM chatbot_sync_log 
  WHERE status = 'failed' 
  ORDER BY created_at DESC 
  LIMIT 10;
"
```

## Support

- **EverShop Issues**: https://github.com/evershopcommerce/evershop/issues
- **Chatbot Admin API**: http://localhost:48080/doc.html
- **Documentation**: See README.md, USAGE.md, and INTEGRATION.md

## Success!

You now have a fully functional AI chatbot integrated with your EverShop store! 🎉

The bot can answer customer questions about:
- Product details, pricing, and availability
- Order status and shipping
- Customer account information
- Store policies and FAQs

Visit the Dashboard regularly to sync data and monitor performance.

