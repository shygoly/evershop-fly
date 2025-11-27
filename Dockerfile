FROM node:20-bullseye AS evershop-source

WORKDIR /opt/evershop

RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 --branch v2.0.0 https://github.com/evershopcommerce/evershop.git .

RUN sed -i "s/enum: \['local'\]/enum: ['local', 's3']/" \
    packages/evershop/src/modules/cms/bootstrap.js

RUN npm install --legacy-peer-deps

RUN npm run compile

RUN npm run compile --workspace @evershop/postgres-query-builder

FROM node:20-bullseye

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates python3 make g++ git && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=evershop-source /opt/evershop /app

# Install official S3 file storage extension, proxy support, and Stream Chat
# Use --legacy-peer-deps to handle React version conflicts
RUN npm install @evershop/s3_file_storage global-agent stream-chat@8.40.0 stream-chat-react@11.22.0 --legacy-peer-deps

# Copy config, patches, scripts, extensions and themes into the image
COPY config /app/config
COPY patches /tmp/patches
COPY scripts /app/scripts
RUN cat <<'EOF' > /app/scripts/entrypoint.sh
#!/bin/sh
set -eu

THEME_SRC_DIR="/app/themes-src"
THEME_DEST_DIR="/app/themes"

if [ -d "$THEME_SRC_DIR" ]; then
  mkdir -p "$THEME_DEST_DIR"

  for candidate in "$THEME_SRC_DIR"/*; do
    [ -d "$candidate" ] || continue
    name="$(basename "$candidate")"
    dest="$THEME_DEST_DIR/$name"
    rm -rf "$dest"
    cp -R "$candidate" "$dest"
  done
fi

if [ "$#" -gt 0 ]; then
  exec "$@"
else
  exec npm start
fi
EOF
COPY extensions /app/extensions
COPY themes /app/themes-src

# Install chatbot extension dependencies (including Stream Chat)
# Remove any legacy/unwanted extensions that might have been copied
RUN rm -rf /app/extensions/s3_file_storage /app/extensions/azure_file_storage \
    /app/extensions/google_login /app/extensions/sendgrid /app/extensions/resend \
    /app/extensions/agegate /app/extensions/product_review

RUN if [ -f /app/extensions/chatbot/package.json ]; then \
  cd /app/extensions/chatbot && HUSKY=0 NPM_CONFIG_PRODUCTION=false npm install --legacy-peer-deps --ignore-scripts --include=dev; \
fi

RUN if [ -f /app/extensions/chatbot/package.json ]; then \
  cd /app/extensions/chatbot && npm run build; \
fi

RUN mkdir -p /app/themes && cp -R /app/themes-src/. /app/themes/
RUN set -eux; \
  for theme in /app/themes/*; do \
    [ -d "${theme}" ] || continue; \
    name="$(basename "${theme}")"; \
    if [ -f "${theme}/package.json" ]; then \
      NPM_CONFIG_PRODUCTION=false npm install --prefix "${theme}" --include=dev; \
      npm run build --prefix "${theme}"; \
      if [ -d "${theme}/dist" ]; then \
        mkdir -p "/app/themes-src/${name}"; \
        rm -rf "/app/themes-src/${name}/dist"; \
        cp -R "${theme}/dist" "/app/themes-src/${name}/dist"; \
      fi; \
    fi; \
  done

# Patch S3 storage plugin to support custom S3-compatible endpoints (e.g., Cloudflare R2)
# Replace S3 service files with patched versions that use process.env and public URLs
COPY patches/awsFileUploader.js /app/node_modules/@evershop/s3_file_storage/dist/services/awsFileUploader.js
COPY patches/awsFileBrowser.js /app/node_modules/@evershop/s3_file_storage/dist/services/awsFileBrowser.js
COPY patches/awsGenerateProductImageVariant.js /app/node_modules/@evershop/s3_file_storage/dist/subscribers/product_image_added/awsGenerateProductImageVariant.js

# Patch other S3 service files for R2 compatibility
RUN set -eux; \
  for f in \
    /app/node_modules/@evershop/s3_file_storage/dist/services/awsFolderCreator.js \
    /app/node_modules/@evershop/s3_file_storage/dist/services/awsFileDeleter.js; do \
    if [ -f "$f" ]; then \
      sed -i 's/new S3Client({ region: getEnv("AWS_REGION") });/new S3Client({ region: getEnv("AWS_REGION"), endpoint: process.env.AWS_ENDPOINT_URL_S3, forcePathStyle: true });/g' "$f"; \
    else \
      echo "Skipping patch for missing file $f"; \
    fi; \
  done

# Patch uploadFile.js to use direct S3 import when file_storage is set to s3
COPY patches/uploadFile.js /app/node_modules/@evershop/evershop/src/modules/cms/services/uploadFile.js

# Fix S3 extension package.json to include main entry point (if exists)
RUN if [ -f /app/node_modules/@evershop/s3_file_storage/package.json ]; then \
      sed -i '/"type": "module",/a\  "main": "dist/bootstrap.js",' \
        /app/node_modules/@evershop/s3_file_storage/package.json; \
    fi

# Patch EverShop core to allow S3 storage in schema validation
# This is necessary because schema validation happens before extensions load
RUN sed -i "s/enum: \['local'\]/enum: ['local', 's3']/" \
    /app/node_modules/@evershop/evershop/src/modules/cms/bootstrap.js

# Patch database connection to support schemas (multi-tenancy)
RUN cp /tmp/patches/connection.js /app/node_modules/@evershop/evershop/dist/lib/postgres/connection.js

# Set memory limit for Node.js build
ENV NODE_OPTIONS="--max-old-space-size=6144"

RUN chmod +x /app/scripts/entrypoint.sh

# Build the app with S3 extension integrated
# The EverShop build step can repopulate legacy extensions; clean out the S3 copy after building.
RUN npm run build && rm -rf /app/extensions/s3_file_storage

ENTRYPOINT ["/bin/sh", "/app/scripts/entrypoint.sh"]
CMD ["npm", "start"]
