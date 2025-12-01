# Stage 1: install dependencies and build EverShop from source
FROM node:18-alpine AS builder
WORKDIR /app

# Install toolchain needed for native modules and keep npm aligned with upstream expectations
RUN apk add --no-cache python3 make g++ && npm install -g npm@9

# Copy project manifests and sources
COPY package*.json ./
COPY tsconfig.json ./
COPY eslint.config.js ./
COPY jest.config.js ./
COPY packages ./packages
COPY extensions ./extensions
COPY translations ./translations
COPY config ./config
COPY themes ./themes-src
COPY scripts ./scripts
COPY patches ./patches

# Install dependencies (core + S3 storage extension)
RUN npm install && npm install --no-save @evershop/s3_file_storage global-agent

# Replace workspace symlinks with published packages so compiled dist files are available
RUN set -eux; \
  mkdir -p node_modules/@evershop; \
  for pkg_ref in @evershop/s3_file_storage@2.0.0 @evershop/postgres-query-builder@2.0.0; do \
    base="${pkg_ref%@*}"; \
    name="${base#@evershop/}"; \
    tarball="$(npm pack "${pkg_ref}" | tail -n1)"; \
    rm -rf "node_modules/@evershop/${name}"; \
    tar -xzf "${tarball}" -C node_modules/@evershop; \
    mv node_modules/@evershop/package "node_modules/@evershop/${name}"; \
    rm "${tarball}"; \
  done

# Stage 2: runtime image
FROM node:18-alpine
WORKDIR /app

# Ensure CA certificates for outbound HTTPS requests
RUN apk add --no-cache ca-certificates && update-ca-certificates

# Copy compiled application and artifacts from builder stage
COPY --from=builder /app /app

# Ensure published workspace packages remain available in the runtime layer
RUN set -eux; \
  mkdir -p /app/node_modules/@evershop; \
  for pkg_ref in @evershop/s3_file_storage@2.0.0 @evershop/postgres-query-builder@2.0.0; do \
    base="${pkg_ref%@*}"; \
    name="${base#@evershop/}"; \
    tarball="$(npm pack "${pkg_ref}" | tail -n1)"; \
    rm -rf "/app/node_modules/@evershop/${name}"; \
    tar -xzf "${tarball}" -C /app/node_modules/@evershop; \
    mv /app/node_modules/@evershop/package "/app/node_modules/@evershop/${name}"; \
    rm "${tarball}"; \
  done

# Copy theme sources so global build commands can locate them
RUN mkdir -p /app/themes && cp -R /app/themes-src/. /app/themes/

# Preinstall and compile themes so dist assets exist ahead of the main build
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

# Set memory limit for Node.js build tasks
ENV NODE_OPTIONS="--max-old-space-size=6144"

# Build and bundle the app with dependencies installed in the builder stage
RUN npm run compile && npm run build

# Apply runtime patches for S3-compatible storage and core overrides
RUN set -eux; \
  mkdir -p /app/node_modules/@evershop/s3_file_storage/dist/services \
    /app/node_modules/@evershop/s3_file_storage/dist/subscribers/product_image_added; \
  cp /app/patches/awsFileUploader.js /app/node_modules/@evershop/s3_file_storage/dist/services/awsFileUploader.js; \
  cp /app/patches/awsFileBrowser.js /app/node_modules/@evershop/s3_file_storage/dist/services/awsFileBrowser.js; \
  cp /app/patches/awsGenerateProductImageVariant.js /app/node_modules/@evershop/s3_file_storage/dist/subscribers/product_image_added/awsGenerateProductImageVariant.js; \
  cp /app/patches/uploadFile.js /app/node_modules/@evershop/evershop/src/modules/cms/services/uploadFile.js; \
  for f in \
    /app/node_modules/@evershop/s3_file_storage/dist/services/awsFolderCreator.js \
    /app/node_modules/@evershop/s3_file_storage/dist/services/awsFileDeleter.js; do \
    sed -i 's/new S3Client({ region: getEnv("AWS_REGION") });/new S3Client({ region: getEnv("AWS_REGION"), endpoint: process.env.AWS_ENDPOINT_URL_S3, forcePathStyle: true });/g' "$f"; \
  done; \
  sed -i '/"type": "module",/a\  "main": "dist/bootstrap.js",' \
    /app/node_modules/@evershop/s3_file_storage/package.json; \
  sed -i "s/enum: \\['local'\\]/enum: ['local', 's3']/" \
    /app/node_modules/@evershop/evershop/src/modules/cms/bootstrap.js

RUN chmod +x /app/scripts/entrypoint.sh

# Remove build-only artifacts to keep the final image leaner
RUN rm -rf /app/patches

ENTRYPOINT ["/bin/sh", "/app/scripts/entrypoint.sh"]
CMD ["npm", "start"]
