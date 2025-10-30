# Changelog

All notable changes to the Chatbot extension will be documented in this file.

## [1.0.0] - 2025-10-27

### Added

- Initial release of Chatbot extension for EverShop
- Integration with Chatbot Admin backend API
- Coze AI bot integration
- Admin dashboard page showing:
  - Today's conversation statistics
  - Knowledge base sync status
  - Quick sync buttons for products/orders/customers
- Admin settings page with:
  - Store name configuration
  - Logo upload capability
  - Data sync preferences (products/orders/customers)
  - Backend API URL configuration
- Database tables:
  - `chatbot_setting` - Store chatbot configuration
  - `chatbot_sync_log` - Track sync operations
- RESTful API endpoints:
  - `POST /api/chatbot/settings` - Save configuration
  - `GET /api/chatbot/status` - Get sync status
  - `POST /api/chatbot/sync` - Trigger data sync
- GraphQL API:
  - Queries: `chatbotSetting`, `chatbotStatus`
  - Mutations: `saveChatbotSetting`, `syncChatbotData`
- Services:
  - `ChatbotApiClient` - Backend API integration
  - `ChatbotSettingService` - Local database operations
  - `TokenCache` - Authentication token management
- Admin menu integration
- Comprehensive documentation

### Features

- Token caching and auto-refresh
- Error handling and logging
- Sync operation tracking
- Real-time status updates
- Responsive UI design
- Type-safe TypeScript implementation

### Documentation

- README.md - Overview
- USAGE.md - User guide
- INTEGRATION.md - Technical details
- QUICKSTART.md - 5-minute setup
- DEPLOYMENT.md - Production deployment
- IMPLEMENTATION_SUMMARY.md - What was built

## [Unreleased]

### Planned Features

- Real-time chat interface in storefront
- Scheduled automatic syncs
- Webhook support for instant updates
- Advanced analytics dashboard
- Multi-language bot support
- Custom bot prompt templates
- Conversation export functionality

