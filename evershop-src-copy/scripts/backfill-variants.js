#!/usr/bin/env node

// Standalone backfill for product image variants without depending on EverShop internals

const path = require('path');
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Client } = require('pg');
const sharp = require('sharp');

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error('[BACKFILL] DATABASE_URL is not set');
  process.exit(2);
}

const BUCKET = process.env.AWS_BUCKET_NAME;
const ENDPOINT = process.env.AWS_ENDPOINT_URL_S3;
const REGION = process.env.AWS_REGION || 'auto';
const PUBLIC_BASE = process.env.PUBLIC_ASSET_BASE_URL || (ENDPOINT && BUCKET ? `${ENDPOINT}/${BUCKET}` : `https://${BUCKET}.s3.amazonaws.com`);

const s3 = new S3Client({ region: REGION, endpoint: ENDPOINT, forcePathStyle: true });

function stripBucketFromKey(key) {
  if (BUCKET && key.startsWith(`${BUCKET}/`)) return key.slice(BUCKET.length + 1);
  return key;
}

async function downloadBufferFromPublicUrl(url) {
  const u = new URL(url);
  let key = u.pathname.replace(/^\//, '');
  key = stripBucketFromKey(key);
  const data = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const buf = await data.Body.transformToByteArray();
  return Buffer.from(buf);
}

async function uploadBuffer(key, buf, contentType) {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buf, ContentType: contentType || 'image/jpeg' }));
  return `${PUBLIC_BASE}/${key}`;
}

(async () => {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  const limit = parseInt(process.env.BACKFILL_LIMIT || '500', 10);

  const q = `
    SELECT product_image_product_id, origin_image, single_image, listing_image, thumb_image
    FROM product_image
    WHERE origin_image IS NOT NULL AND origin_image <> ''
      AND (
        single_image IS NULL OR single_image = '' OR
        listing_image IS NULL OR listing_image = '' OR
        thumb_image IS NULL OR thumb_image = ''
      )
    ORDER BY product_image_product_id
    LIMIT $1
  `;

  const res = await client.query(q, [limit]);
  console.log(`[BACKFILL] Found ${res.rowCount} images`);

  let ok = 0, fail = 0;
  for (const row of res.rows) {
    try {
      const originalUrl = row.origin_image;
      // Derive base key
      const u = new URL(originalUrl);
      const originalKey = stripBucketFromKey(u.pathname.replace(/^\//, ''));
      const ext = path.extname(originalKey) || '.jpg';
      const base = originalKey.slice(0, -ext.length);

      // Download original
      const originalBuf = await downloadBufferFromPublicUrl(originalUrl);

      // Generate variants
      const singleBuf = await sharp(originalBuf).resize({ width: 500, height: 500, fit: 'inside' }).toBuffer();
      const listingBuf = await sharp(originalBuf).resize({ width: 250, height: 250, fit: 'inside' }).toBuffer();
      const thumbBuf = await sharp(originalBuf).resize({ width: 100, height: 100, fit: 'inside' }).toBuffer();

      // Upload
      const singleKey = `${base}-single${ext}`;
      const listingKey = `${base}-listing${ext}`;
      const thumbKey = `${base}-thumbnail${ext}`;

      const [singleUrl, listingUrl, thumbUrl] = await Promise.all([
        uploadBuffer(singleKey, singleBuf, 'image/jpeg'),
        uploadBuffer(listingKey, listingBuf, 'image/jpeg'),
        uploadBuffer(thumbKey, thumbBuf, 'image/jpeg')
      ]);

      // Update DB
      await client.query(
        `UPDATE product_image
         SET single_image=$1, listing_image=$2, thumb_image=$3
         WHERE product_image_product_id=$4 AND origin_image=$5`,
        [singleUrl, listingUrl, thumbUrl, row.product_image_product_id, row.origin_image]
      );

      ok++;
    } catch (e) {
      console.error('[BACKFILL] Error for', row.product_image_product_id, e && e.message ? e.message : e);
      fail++;
    }
  }

  console.log(`[BACKFILL] Completed. success=${ok}, failed=${fail}`);
  await client.end();
  process.exit(0);
})().catch(async (e) => {
  console.error('[BACKFILL] Fatal', e);
  process.exit(1);
});
