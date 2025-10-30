# Chatbot Extension - Deployment Guide

## Pre-Deployment Checklist

### 1. Backend Requirements

- [ ] Chatbot Admin backend is deployed and accessible
- [ ] Backend API URL is configured (production URL)
- [ ] Tenant ID is obtained from backend admin
- [ ] Backend is using PostgreSQL (for data persistence)
- [ ] Backend API is accessible from EverShop server

### 2. Environment Configuration

- [ ] Update `config/production.json` with chatbot settings
- [ ] Set `CHATBOT_BACKEND_API_URL` environment variable
- [ ] Set `CHATBOT_TENANT_ID` environment variable
- [ ] Verify database connection string
- [ ] Check firewall rules allow API communication

### 3. Database Setup

- [ ] EverShop database is using PostgreSQL
- [ ] Database user has CREATE TABLE permissions
- [ ] Migrations will run automatically on deployment
- [ ] Backup existing database before deployment

## Deployment Steps

### Step 1: Build Application

```bash
cd /Users/mac/projects/ecommerce/evershop-src

# Install dependencies
npm install

# Build the application
npm run build
```

### Step 2: Run Database Migrations

Migrations run automatically on first start, but you can verify:

```bash
# Start the application (migrations run automatically)
npm run dev

# Or for production:
NODE_ENV=production npm start
```

### Step 3: Verify Installation

```bash
# Check if tables were created
psql -d your_evershop_db -c "\d chatbot_setting"
psql -d your_evershop_db -c "\d chatbot_sync_log"
```

Expected output: Table structure should be displayed

### Step 4: Test API Endpoints

```bash
# Test status endpoint
curl -X GET "http://your-domain.com/api/chatbot/status?shop_id=evershop-default"

# Test save settings
curl -X POST "http://your-domain.com/api/chatbot/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "shop_id": "evershop-default",
    "shop_name": "My Store",
    "sync_products": true,
    "sync_orders": true,
    "sync_customers": true
  }'
```

### Step 5: Access Admin Panel

1. Log into EverShop admin panel
2. Navigate to **Chatbot → Settings**
3. Configure your store information
4. Click **Save Settings**
5. Go to **Chatbot → Dashboard**
6. Click sync buttons to test data synchronization

## Production Configuration

### config/production.json

```json
{
  "chatbot": {
    "enabled": true,
    "backendApiUrl": "https://your-chatbot-admin-api.com",
    "defaultTenantId": 1,
    "defaultShopId": "your-production-shop-id"
  }
}
```

### Environment Variables

```bash
# .env or system environment
CHATBOT_BACKEND_API_URL=https://your-chatbot-admin-api.com
CHATBOT_TENANT_ID=1
CHATBOT_SHOP_ID=your-production-shop-id
```

## Docker Deployment

If using Docker:

### Dockerfile

Ensure the extension is included:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY extensions/chatbot ./extensions/chatbot

RUN npm install
RUN npm run build

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  evershop:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - CHATBOT_BACKEND_API_URL=http://chatbot-admin:48080
      - CHATBOT_TENANT_ID=1
    depends_on:
      - postgres
  
  chatbot-admin:
    image: your-chatbot-admin-image
    ports:
      - "48080:48080"
    depends_on:
      - postgres
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=evershop
      - POSTGRES_USER=evershop
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Monitoring

### Health Checks

```bash
# Check if extension is loaded
curl http://your-domain.com/api/chatbot/status?shop_id=evershop-default

# Check sync logs
psql -d evershop -c "
  SELECT sync_type, status, COUNT(*) 
  FROM chatbot_sync_log 
  WHERE created_at > NOW() - INTERVAL '24 hours'
  GROUP BY sync_type, status;
"
```

### Performance Monitoring

```sql
-- Sync success rate (last 7 days)
SELECT 
  sync_type,
  COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) as success_rate,
  AVG(item_count) as avg_items
FROM chatbot_sync_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY sync_type;

-- Failed syncs in last 24 hours
SELECT * FROM chatbot_sync_log
WHERE status = 'failed' 
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Rollback Plan

If issues occur:

### 1. Disable Extension

In `config/production.json`:

```json
{
  "chatbot": {
    "enabled": false
  }
}
```

Then restart the application.

### 2. Remove Database Tables

```sql
DROP TABLE IF EXISTS chatbot_sync_log;
DROP TABLE IF EXISTS chatbot_setting;
```

### 3. Remove Extension Files

```bash
rm -rf extensions/chatbot
```

### 4. Rebuild

```bash
npm run build
npm start
```

## Troubleshooting

### Issue: Extension not loading

**Solution**:
```bash
# Check if extension directory exists
ls -la extensions/chatbot/

# Rebuild application
npm run build

# Check build output for errors
```

### Issue: Database tables not created

**Solution**:
```bash
# Check migration files
ls extensions/chatbot/src/migration/

# Manually run migration
psql -d evershop < extensions/chatbot/src/migration/Version-1.0.0.sql

# Or use EverShop CLI if available
```

### Issue: API endpoints return 404

**Solution**:
- Verify route.json files exist
- Check file paths match EverShop conventions
- Rebuild application
- Check server logs for routing errors

### Issue: Cannot connect to chatbotadmin

**Solution**:
- Verify backend URL in settings
- Check network connectivity
- Test with curl: `curl http://backend-url/v3/api-docs`
- Check firewall rules
- Verify chatbotadmin is running

## Maintenance

### Regular Tasks

1. **Weekly**: Check sync logs for errors
2. **Monthly**: Review conversation statistics
3. **Quarterly**: Update bot prompts based on feedback
4. **As Needed**: Sync data after major product updates

### Database Maintenance

```sql
-- Archive old sync logs (older than 90 days)
DELETE FROM chatbot_sync_log 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Vacuum tables
VACUUM ANALYZE chatbot_setting;
VACUUM ANALYZE chatbot_sync_log;
```

## Scaling Considerations

### High Traffic Scenarios

1. **Rate Limiting**: Add rate limiting to sync endpoints
2. **Queue System**: Use job queue for large syncs
3. **Caching**: Cache sync status for 5 minutes
4. **Connection Pooling**: Increase database pool size

### Multi-Store Setup

Each store should have a unique `shop_id`:

```javascript
// In configuration
const shopId = `store-${storeId}`;
```

## Security Hardening

### Production Best Practices

1. **HTTPS Only**: Ensure all API calls use HTTPS
2. **Token Rotation**: Implement token rotation policy
3. **Access Control**: Restrict API endpoints to admin users only
4. **Input Validation**: All inputs are validated server-side
5. **SQL Injection**: Using parameterized queries
6. **XSS Protection**: React auto-escapes by default

### Secrets Management

```bash
# Use environment variables for sensitive data
export CHATBOT_BACKEND_API_URL="https://secure-api.com"
export CHATBOT_TENANT_ID="production-tenant-id"

# Never commit tokens or passwords
# Add to .gitignore:
.env
.env.local
.env.production
```

## Success Metrics

After deployment, monitor:

- ✅ Sync success rate > 95%
- ✅ Average sync time < 30 seconds
- ✅ Zero critical errors in logs
- ✅ User adoption (visits to Dashboard/Settings)
- ✅ Chat conversation count growing

## Support

### Deployment Issues

- Check EverShop logs: `logs/evershop.log`
- Check database logs
- Review sync_log table for errors
- Test API endpoints individually

### Getting Help

- EverShop Documentation: https://evershop.io/docs
- Chatbot Admin API Docs: http://localhost:48080/doc.html
- Extension documentation in this directory

## Deployment Complete! 🎉

Your EverShop store now has an AI-powered chatbot that can:
- Answer product questions
- Help with order inquiries
- Provide customer support
- Learn from your store data

Monitor the Dashboard regularly and keep data synced for best results!

