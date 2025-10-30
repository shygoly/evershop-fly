FROM evershop/evershop:1.2.2

# App workdir inside the base image
WORKDIR /app

# Ensure CA certificates for TLS (needed for HTTPS to S3-compatible endpoints)
RUN apk add --no-cache ca-certificates && update-ca-certificates

# Install official S3 file storage extension and proxy support
RUN npm install @evershop/s3_file_storage global-agent

# Copy config, patches and scripts into the image
COPY config /app/config
COPY patches /tmp/patches
COPY scripts /app/scripts
COPY themes /app/themes-src

RUN mkdir -p /app/themes && cp -R /app/themes-src/. /app/themes/
RUN set -eux; \
  for theme in /app/themes/*; do \
    [ -d "${theme}" ] || continue; \
    name="$(basename "${theme}")"; \
    if [ -f "${theme}/package.json" ]; then \
      npm install --prefix "${theme}"; \
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
    sed -i 's/new S3Client({ region: getEnv("AWS_REGION") });/new S3Client({ region: getEnv("AWS_REGION"), endpoint: process.env.AWS_ENDPOINT_URL_S3, forcePathStyle: true });/g' "$f"; \
  done

# Patch uploadFile.js to use direct S3 import when file_storage is set to s3
COPY patches/uploadFile.js /app/node_modules/@evershop/evershop/src/modules/cms/services/uploadFile.js

# Fix S3 extension package.json to include main entry point
RUN sed -i '/"type": "module",/a\  "main": "dist/bootstrap.js",' \
    /app/node_modules/@evershop/s3_file_storage/package.json

# Patch EverShop core to allow S3 storage in schema validation
# This is necessary because schema validation happens before extensions load
RUN sed -i "s/enum: \\['local'\\]/enum: ['local', 's3']/" \
    /app/node_modules/@evershop/evershop/src/modules/cms/bootstrap.js

# Set memory limit for Node.js build
ENV NODE_OPTIONS="--max-old-space-size=6144"

RUN chmod +x /app/scripts/entrypoint.sh

# Build the app with S3 extension integrated
RUN npm run build

ENTRYPOINT ["/bin/sh", "/app/scripts/entrypoint.sh"]
CMD ["npm", "start"]
