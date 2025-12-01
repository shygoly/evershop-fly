#!/bin/sh
# sync-r2-config.sh
# 从 Cloudflare R2 同步用户自定义配置（主题、插件、配置覆盖）
#
# 环境变量:
#   R2_CONFIG_BUCKET     - R2 bucket 名称 (例如: shopsaas-configs)
#   R2_CONFIG_PREFIX     - shop 的前缀路径 (例如: shop-abc123)
#   AWS_ACCESS_KEY_ID    - R2 访问密钥
#   AWS_SECRET_ACCESS_KEY - R2 密钥
#   AWS_ENDPOINT_URL_S3  - R2 端点 (例如: https://xxx.r2.cloudflarestorage.com)
#   AWS_REGION           - 区域 (R2 使用 auto)

set -eu

# 检查必要的环境变量
if [ -z "${R2_CONFIG_BUCKET:-}" ] || [ -z "${R2_CONFIG_PREFIX:-}" ]; then
  echo "[sync-r2-config] Skipping R2 sync: R2_CONFIG_BUCKET or R2_CONFIG_PREFIX not set"
  exit 0
fi

if [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ] || [ -z "${AWS_ENDPOINT_URL_S3:-}" ]; then
  echo "[sync-r2-config] Skipping R2 sync: AWS credentials not configured"
  exit 0
fi

echo "[sync-r2-config] Starting configuration sync from R2..."
echo "[sync-r2-config] Bucket: ${R2_CONFIG_BUCKET}"
echo "[sync-r2-config] Prefix: ${R2_CONFIG_PREFIX}"

# 创建临时目录
SYNC_TMP_DIR="/tmp/r2-sync-$$"
mkdir -p "$SYNC_TMP_DIR"

# 清理函数
cleanup() {
  rm -rf "$SYNC_TMP_DIR"
}
trap cleanup EXIT

# 下载 manifest.json
MANIFEST_URL="s3://${R2_CONFIG_BUCKET}/${R2_CONFIG_PREFIX}/manifest.json"
MANIFEST_FILE="$SYNC_TMP_DIR/manifest.json"

echo "[sync-r2-config] Downloading manifest from ${MANIFEST_URL}..."

# 使用 node 脚本下载（因为 AWS CLI 可能没安装）
node /app/scripts/r2-download.mjs "$R2_CONFIG_BUCKET" "${R2_CONFIG_PREFIX}/manifest.json" "$MANIFEST_FILE" 2>/dev/null || {
  echo "[sync-r2-config] No manifest found, skipping sync"
  exit 0
}

if [ ! -f "$MANIFEST_FILE" ]; then
  echo "[sync-r2-config] Manifest download failed, skipping sync"
  exit 0
fi

echo "[sync-r2-config] Manifest downloaded successfully"

# 解析 manifest 并同步文件
node /app/scripts/r2-sync.mjs "$MANIFEST_FILE" "$R2_CONFIG_BUCKET" "$R2_CONFIG_PREFIX" "$SYNC_TMP_DIR"

echo "[sync-r2-config] Configuration sync completed"
