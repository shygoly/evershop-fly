#!/usr/bin/env node
/**
 * r2-download.mjs
 * 从 Cloudflare R2 下载单个文件
 *
 * Usage: node r2-download.mjs <bucket> <key> <localPath>
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { pipeline } from 'stream/promises';

const [bucket, key, localPath] = process.argv.slice(2);

if (!bucket || !key || !localPath) {
  console.error('Usage: node r2-download.mjs <bucket> <key> <localPath>');
  process.exit(1);
}

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function download() {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3.send(command);

    // 确保目录存在
    await mkdir(dirname(localPath), { recursive: true });

    // 写入文件
    const writeStream = createWriteStream(localPath);
    await pipeline(response.Body, writeStream);

    console.log(`Downloaded: ${key} -> ${localPath}`);
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      console.error(`File not found: ${key}`);
      process.exit(1);
    }
    throw error;
  }
}

download().catch((err) => {
  console.error('Download failed:', err.message);
  process.exit(1);
});
