# EverShop Chatbot Extension

AI-powered customer service chatbot integration for EverShop.

## Features

- AI customer service bot powered by Coze
- Automatic knowledge base sync (Products, Orders, Customers)
- Chat conversation management
- Store branding configuration (Logo, Name)
- Real-time sync status dashboard

## Configuration

Add to your EverShop config file:

```json
{
  "chatbot": {
    "enabled": true,
    "backendApiUrl": "http://localhost:48080",
    "defaultTenantId": 1
  }
}
```

## Requirements

- EverShop >= 1.2.0
- Chatbot Admin Backend running
- PostgreSQL database

## Installation

The extension is automatically loaded when placed in the `extensions/` directory.

## Usage

1. Navigate to Admin Panel → Chatbot → Settings
2. Configure your store name and logo
3. Select which data to sync (Products, Orders, Customers)
4. Click sync buttons to update knowledge base
5. Monitor sync status on the Dashboard

## API Integration

This extension integrates with the Chatbot Admin API to:
- Initialize store and create Coze bot
- Sync data to knowledge base
- Track conversation statistics
- Manage bot settings

