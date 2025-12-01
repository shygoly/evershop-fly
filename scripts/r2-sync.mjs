#!/usr/bin/env node
/**
 * r2-sync.mjs
 * 解析 manifest.json 并从 R2 同步主题、插件、配置到本地
 *
 * Usage: node r2-sync.mjs <manifestPath> <bucket> <prefix> <tmpDir>
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream, readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { mkdir, rm } from 'fs/promises';
import { dirname, join, basename } from 'path';
import { pipeline } from 'stream/promises';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

const [manifestPath, bucket, prefix, tmpDir] = process.argv.slice(2);

if (!manifestPath || !bucket || !prefix || !tmpDir) {
  console.error('Usage: node r2-sync.mjs <manifestPath> <bucket> <prefix> <tmpDir>');
  process.exit(1);
}

// 目标目录
const THEMES_DIR = '/app/themes';
const EXTENSIONS_DIR = '/app/extensions';
const CONFIG_DIR = '/app/config';

// S3 客户端
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * 从 R2 下载文件到本地
 */
async function downloadFile(key, localPath) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3.send(command);
  await mkdir(dirname(localPath), { recursive: true });
  const writeStream = createWriteStream(localPath);
  await pipeline(response.Body, writeStream);
  console.log(`[r2-sync] Downloaded: ${key}`);
}

/**
 * 计算文件的 SHA256 校验和
 */
function calculateChecksum(filePath) {
  const content = readFileSync(filePath);
  return 'sha256:' + createHash('sha256').update(content).digest('hex');
}

/**
 * 解压 tar.gz 文件
 */
function extractTarGz(archivePath, destDir) {
  mkdirSync(destDir, { recursive: true });
  execSync(`tar -xzf "${archivePath}" -C "${destDir}"`, { stdio: 'inherit' });
  console.log(`[r2-sync] Extracted: ${basename(archivePath)} -> ${destDir}`);
}

/**
 * 深度合并两个对象
 */
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * 同步主题
 */
async function syncThemes(themes) {
  if (!themes || themes.length === 0) {
    console.log('[r2-sync] No themes to sync');
    return;
  }

  for (const theme of themes) {
    if (!theme.enabled) {
      console.log(`[r2-sync] Skipping disabled theme: ${theme.name}`);
      continue;
    }

    const r2Key = `${prefix}/${theme.path}`;
    const localArchive = join(tmpDir, 'themes', `${theme.name}.tar.gz`);
    const destDir = join(THEMES_DIR, theme.name);

    try {
      // 下载主题包
      await downloadFile(r2Key, localArchive);

      // 验证校验和（如果提供）
      if (theme.checksum) {
        const actualChecksum = calculateChecksum(localArchive);
        if (actualChecksum !== theme.checksum) {
          console.error(`[r2-sync] Checksum mismatch for theme ${theme.name}`);
          console.error(`[r2-sync] Expected: ${theme.checksum}`);
          console.error(`[r2-sync] Actual: ${actualChecksum}`);
          continue;
        }
      }

      // 删除旧主题目录（如果存在）
      if (existsSync(destDir)) {
        await rm(destDir, { recursive: true });
      }

      // 解压到主题目录
      extractTarGz(localArchive, THEMES_DIR);

      console.log(`[r2-sync] Theme synced: ${theme.name}`);
    } catch (error) {
      console.error(`[r2-sync] Failed to sync theme ${theme.name}:`, error.message);
    }
  }
}

/**
 * 同步插件
 */
async function syncExtensions(extensions) {
  if (!extensions || extensions.length === 0) {
    console.log('[r2-sync] No extensions to sync');
    return;
  }

  // 按优先级排序（数字越小优先级越高）
  const sortedExtensions = [...extensions].sort((a, b) => (a.priority || 100) - (b.priority || 100));

  for (const ext of sortedExtensions) {
    if (!ext.enabled) {
      console.log(`[r2-sync] Skipping disabled extension: ${ext.name}`);
      continue;
    }

    const r2Key = `${prefix}/${ext.path}`;
    const localArchive = join(tmpDir, 'extensions', `${ext.name}.tar.gz`);
    const destDir = join(EXTENSIONS_DIR, ext.name);

    try {
      // 下载插件包
      await downloadFile(r2Key, localArchive);

      // 验证校验和（如果提供）
      if (ext.checksum) {
        const actualChecksum = calculateChecksum(localArchive);
        if (actualChecksum !== ext.checksum) {
          console.error(`[r2-sync] Checksum mismatch for extension ${ext.name}`);
          console.error(`[r2-sync] Expected: ${ext.checksum}`);
          console.error(`[r2-sync] Actual: ${actualChecksum}`);
          continue;
        }
      }

      // 删除旧插件目录（如果存在）
      if (existsSync(destDir)) {
        await rm(destDir, { recursive: true });
      }

      // 解压到插件目录
      extractTarGz(localArchive, EXTENSIONS_DIR);

      console.log(`[r2-sync] Extension synced: ${ext.name}`);
    } catch (error) {
      console.error(`[r2-sync] Failed to sync extension ${ext.name}:`, error.message);
    }
  }
}

/**
 * 同步配置覆盖
 */
async function syncConfig(configInfo) {
  if (!configInfo || !configInfo.enabled) {
    console.log('[r2-sync] No config override to sync');
    return;
  }

  const r2Key = `${prefix}/${configInfo.path}`;
  const localConfig = join(tmpDir, 'config', 'custom.json');
  const destConfig = join(CONFIG_DIR, 'custom.json');

  try {
    // 下载配置文件
    await downloadFile(r2Key, localConfig);

    // 验证校验和（如果提供）
    if (configInfo.checksum) {
      const actualChecksum = calculateChecksum(localConfig);
      if (actualChecksum !== configInfo.checksum) {
        console.error(`[r2-sync] Checksum mismatch for config`);
        console.error(`[r2-sync] Expected: ${configInfo.checksum}`);
        console.error(`[r2-sync] Actual: ${actualChecksum}`);
        return;
      }
    }

    // 读取下载的配置
    const customConfig = JSON.parse(readFileSync(localConfig, 'utf-8'));

    // 如果存在现有的 custom.json，进行合并
    let finalConfig = customConfig;
    if (existsSync(destConfig)) {
      const existingConfig = JSON.parse(readFileSync(destConfig, 'utf-8'));
      finalConfig = deepMerge(existingConfig, customConfig);
    }

    // 写入最终配置
    mkdirSync(dirname(destConfig), { recursive: true });
    writeFileSync(destConfig, JSON.stringify(finalConfig, null, 2));

    console.log(`[r2-sync] Config synced: ${destConfig}`);
  } catch (error) {
    console.error(`[r2-sync] Failed to sync config:`, error.message);
  }
}

/**
 * 更新 EverShop 配置以使用同步的主题和插件
 */
function updateEvershopConfig(manifest) {
  const configPath = join(CONFIG_DIR, 'custom.json');

  let config = {};
  if (existsSync(configPath)) {
    config = JSON.parse(readFileSync(configPath, 'utf-8'));
  }

  // 初始化 system 配置
  if (!config.system) config.system = {};

  // 更新主题配置
  if (manifest.themes && manifest.themes.length > 0) {
    const enabledTheme = manifest.themes.find(t => t.enabled);
    if (enabledTheme) {
      config.system.theme = enabledTheme.name;
      console.log(`[r2-sync] Set active theme: ${enabledTheme.name}`);
    }
  }

  // 更新插件配置
  if (manifest.extensions && manifest.extensions.length > 0) {
    const existingExtensions = config.system.extensions || [];
    const existingNames = new Set(existingExtensions.map(e => e.name));

    const newExtensions = manifest.extensions
      .filter(e => e.enabled && !existingNames.has(e.name))
      .map(e => ({
        name: e.name,
        resolve: `extensions/${e.name}`,
        enabled: true,
        priority: e.priority || 100,
      }));

    config.system.extensions = [...existingExtensions, ...newExtensions];
    console.log(`[r2-sync] Added ${newExtensions.length} new extension(s) to config`);
  }

  // 写入配置
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`[r2-sync] Updated EverShop config`);
}

/**
 * 主函数
 */
async function main() {
  console.log('[r2-sync] Starting sync process...');

  // 读取 manifest
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  console.log(`[r2-sync] Manifest version: ${manifest.version}`);
  console.log(`[r2-sync] Last modified: ${manifest.lastModified}`);

  // 同步主题
  await syncThemes(manifest.themes);

  // 同步插件
  await syncExtensions(manifest.extensions);

  // 同步配置覆盖
  await syncConfig(manifest.config);

  // 更新 EverShop 配置
  updateEvershopConfig(manifest);

  console.log('[r2-sync] Sync process completed');
}

main().catch((err) => {
  console.error('[r2-sync] Sync failed:', err.message);
  process.exit(1);
});
