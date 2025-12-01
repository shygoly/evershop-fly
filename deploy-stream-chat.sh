#!/bin/bash

# Deploy Script for EverShop with Stream Chat Integration
# This script deploys evershop-fly to fly.io with Stream Chat enabled

set -e

echo "🚀 Starting deployment of evershop-fly with Stream Chat..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo -e "${RED}❌ Fly CLI not found. Please install it first:${NC}"
    echo "brew install flyctl"
    exit 1
fi

# Check if logged in to Fly
if ! fly auth whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Fly. Please login:${NC}"
    echo "fly auth login"
    exit 1
fi

# Verify we're in the right directory
if [ ! -f "Dockerfile" ] || [ ! -d "extensions/chatbot" ]; then
    echo -e "${RED}❌ Must run from evershop-fly directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-deployment checklist:${NC}"
echo "1. Stream Chat API Key and Secret obtained? (https://dashboard.getstream.io/)"
echo "2. chatbot-node deployed and configured? (https://chatbot-node.fly.dev)"
echo "3. Coze API configured in chatbot-node? (api.coze.cn)"
echo "4. SSO secrets configured?"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPL =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Check if secrets need to be set
echo -e "${YELLOW}🔑 Checking environment variables...${NC}"

# Function to check if secret exists
check_secret() {
    local app=$1
    local secret_name=$2
    fly secrets list --app "$app" 2>/dev/null | grep -q "^$secret_name" && return 0 || return 1
}

# List of required secrets
REQUIRED_SECRETS=(
    "CHATBOT_ENABLED"
    "CHATBOT_NODE_URL"
    "CHATBOT_SHOP_ID"
    "CHATBOT_SSO_SECRET"
    "STREAM_CHAT_ENABLED"
    "STREAM_CHAT_API_KEY"
    "STREAM_CHAT_API_SECRET"
)

MISSING_SECRETS=()
for secret in "${REQUIRED_SECRETS[@]}"; do
    if ! check_secret "evershop-fly" "$secret"; then
        MISSING_SECRETS+=("$secret")
    fi
done

if [ ${#MISSING_SECRETS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing secrets detected:${NC}"
    for secret in "${MISSING_SECRETS[@]}"; do
        echo "  - $secret"
    done
    echo ""
    echo -e "${YELLOW}You need to set these secrets before deployment:${NC}"
    echo ""
    echo "fly secrets set \\"
    echo "  CHATBOT_ENABLED=\"true\" \\"
    echo "  CHATBOT_NODE_URL=\"https://chatbot-node.fly.dev\" \\"
    echo "  CHATBOT_SHOP_ID=\"evershop-fly\" \\"
    echo "  CHATBOT_SSO_SECRET=\"your-shared-secret\" \\"
    echo "  CHATBOT_WEBHOOK_SECRET=\"your-webhook-secret\" \\"
    echo "  STREAM_CHAT_ENABLED=\"true\" \\"
    echo "  STREAM_CHAT_API_KEY=\"your-stream-api-key\" \\"
    echo "  STREAM_CHAT_API_SECRET=\"your-stream-api-secret\" \\"
    echo "  --app evershop-fly"
    echo ""
    read -p "Set secrets now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Opening Fly.io secrets documentation..."
        open "https://fly.io/docs/reference/secrets/"
        exit 1
    else
        echo "Please set secrets manually before deploying."
        exit 1
    fi
fi

echo -e "${GREEN}✅ All required secrets are set${NC}"

# Build and deploy
echo -e "${YELLOW}🏗️  Building and deploying to Fly.io...${NC}"

fly deploy --app evershop-fly --strategy rolling

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${GREEN}🎉 Stream Chat widget is now live!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Visit your store: https://evershop-fly.fly.dev"
    echo "2. Look for the chat button in bottom-right corner"
    echo "3. Test sending a message"
    echo ""
    echo "View logs:"
    echo "  fly logs --app evershop-fly"
    echo ""
    echo "SSH into container:"
    echo "  fly ssh console --app evershop-fly"
    echo ""
    echo "Monitor status:"
    echo "  fly status --app evershop-fly"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check logs: fly logs --app evershop-fly"
    exit 1
fi


