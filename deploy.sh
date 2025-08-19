#!/bin/bash

# Load environment variables from .env if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if required environment variables are set
if [ -z "$DEPLOY_SERVER_HOST" ] || [ -z "$DEPLOY_SERVER_USER" ] || [ -z "$DEPLOY_SERVER_PATH" ]; then
    echo "Error: Required deployment environment variables are not set."
    echo "Please create a .env file with the following variables:"
    echo "DEPLOY_SERVER_HOST=your_server_ip"
    echo "DEPLOY_SERVER_USER=your_username"
    echo "DEPLOY_SERVER_PATH=/path/to/your/site"
    exit 1
fi

if [ -z "$CLOUDFLARE_ZONE_ID" ] || [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "Error: Required Cloudflare environment variables are not set."
    echo "Please create a .env file with the following variables:"
    echo "CLOUDFLARE_ZONE_ID=your_zone_id"
    echo "CLOUDFLARE_API_TOKEN=your_api_token"
    exit 1
fi

# Build the project
echo "Building project..."
pnpm build

# Sync the out folder to remote server
echo "Syncing to remote server..."
rsync -avz out/ ${DEPLOY_SERVER_USER}@${DEPLOY_SERVER_HOST}:${DEPLOY_SERVER_PATH}

# Fix permissions on remote server
echo "Fixing permissions..."
ssh ${DEPLOY_SERVER_USER}@${DEPLOY_SERVER_HOST} <<ENDSSH
  chmod -R o+r ${DEPLOY_SERVER_PATH}
  find ${DEPLOY_SERVER_PATH} -type d -exec chmod o+rx {} \;
  echo "Permissions fixed."
ENDSSH

echo "Deployment complete!"

sleep 5

curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
     -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'

echo "Cache purged!"