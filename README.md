# EverShop on Fly.io with S3 Storage

这是一个配置了 S3 兼容存储的 EverShop 电商平台，部署在 Fly.io 上。

## 快速部署

### 1. 选择并配置 S3 存储

参见 [S3_STORAGE_SETUP.md](./S3_STORAGE_SETUP.md) 获取详细的配置指南。

**推荐选择**：
- **Cloudflare R2**（免费 10GB + 零出站费用）
- **Backblaze B2**（免费 10GB + 低成本）

### 2. 设置环境变量

以 Cloudflare R2 为例：

```bash
fly secrets set \
  AWS_ACCESS_KEY_ID="your_r2_access_key_id" \
  AWS_SECRET_ACCESS_KEY="your_r2_secret_access_key" \
  AWS_REGION="auto" \
  AWS_BUCKET_NAME="evershop-media" \
  AWS_ENDPOINT_URL_S3="https://<account_id>.r2.cloudflarestorage.com" \
  -a evershop-fly
```

### 3. 部署应用

```bash
fly deploy -a evershop-fly
```

### 4. 访问应用

```
https://evershop-fly.fly.dev
```

## 项目结构

```
evershop-fly/
├── Dockerfile              # Docker 构建文件（使用官方镜像 + S3 扩展）
├── fly.toml               # Fly.io 配置文件
├── config/
│   ├── default.json       # EverShop 默认配置
│   └── production.json    # 生产环境配置
├── sample-data/
│   └── biosurf/           # BioSurf 主题示例产品数据与 SVG 图片
├── S3_STORAGE_SETUP.md    # S3 存储详细配置指南
└── README.md              # 本文件
```

## BioSurf 主题与示例数据

- 新增 **BioSurf** 主题（`themes/biosurf`），基于医疗级配色与 AI 实验助手设计稿定制首页区块、全局色板与表单样式。部署后默认启用。
- `sample-data/biosurf/products.json` 与 `sample-data/biosurf/images/` 提供后台可导入的产品示例，涵盖清洁剂、科研试剂、细胞材料等，与主题视觉一致。
- 登录后台 (`/admin`) 创建产品时，可直接上传 `images/` 内的 SVG 作为示例图，或根据 README 中的说明使用 GraphQL API 批量导入。

## 配置说明

### Dockerfile
- 基于官方 `evershop/evershop:1.2.2` 镜像
- 安装 `@evershop/s3_file_storage` 官方 S3 扩展
- 复制配置文件到容器

### config/default.json & production.json
- 启用 S3 文件存储：`"file_storage": "s3"`
- 加载官方 S3 扩展：`@evershop/s3_file_storage`
- 数据库连接配置

### 环境变量（通过 Fly.io Secrets 设置）
- `AWS_ACCESS_KEY_ID`: S3 访问密钥 ID
- `AWS_SECRET_ACCESS_KEY`: S3 访问密钥
- `AWS_REGION`: S3 区域
- `AWS_BUCKET_NAME`: S3 bucket 名称
- `AWS_ENDPOINT_URL_S3`: S3 endpoint URL（S3 兼容服务必需）

## 支持的存储提供商

✅ Cloudflare R2
✅ Backblaze B2
✅ Wasabi
✅ AWS S3
✅ DigitalOcean Spaces
✅ 任何 S3 兼容的存储服务

详细配置见 [S3_STORAGE_SETUP.md](./S3_STORAGE_SETUP.md)

## 常用命令

### 查看应用状态
```bash
fly status -a evershop-fly
```

### 查看日志
```bash
fly logs -a evershop-fly
```

### 查看环境变量
```bash
fly secrets list -a evershop-fly
```

### SSH 进入容器
```bash
fly ssh console -a evershop-fly
```

### 更新环境变量
```bash
fly secrets set KEY=VALUE -a evershop-fly
```

### 重新部署
```bash
fly deploy -a evershop-fly
```

## 故障排查

### 文件上传失败
1. 检查环境变量是否正确设置：
   ```bash
   fly secrets list -a evershop-fly
   ```

2. 查看应用日志：
   ```bash
   fly logs -a evershop-fly
   ```

3. 验证 S3 凭证是否有效

4. 检查 bucket 权限配置

### 图片无法显示
1. 确认 bucket 已配置公共访问
2. 检查图片 URL 是否正确
3. 验证 CORS 设置（如需要）

更多故障排查信息，请参见 [S3_STORAGE_SETUP.md](./S3_STORAGE_SETUP.md)

## 本地测试

### 项目结构

```
evershop-fly/
├── Dockerfile                # Docker 镜像定义
├── config/                   # EverShop 配置文件
│   ├── default.json         # 默认配置（用于 Fly.io）
│   └── production.json      # 生产环境配置（用于本地测试）
├── patches/                  # 运行时补丁文件（固化到镜像）
│   ├── awsFileUploader.js   # 修复的 S3 上传器
│   └── uploadFile.js        # 修复的文件上传服务
└── evershop-local-test/     # 本地测试环境
    └── docker-compose.yml   # Docker Compose 配置
```

### 1. 构建镜像

```bash
cd /Users/mac/Sync/project/ecommerce/evershop-fly
docker build --memory=10.69g -t evershop-s3:local .
```

### 2. 配置环境变量

编辑 `evershop-local-test/docker-compose.yml`，配置您的 R2 凭证：

```yaml
environment:
  # S3 / Cloudflare R2 配置
  AWS_ACCESS_KEY_ID: your_r2_access_key
  AWS_SECRET_ACCESS_KEY: your_r2_secret_key
  AWS_REGION: auto
  AWS_BUCKET_NAME: your_bucket_name
  AWS_ENDPOINT_URL_S3: https://your-account-id.r2.cloudflarestorage.com

  # R2 公共域名（用于图片预览）
  PUBLIC_ASSET_BASE_URL: https://your-public-domain.r2.dev
```

### 3. 启动服务

```bash
cd evershop-local-test
docker-compose up -d
```

### 4. 访问应用

- 前台：http://localhost:3000
- 管理后台：http://localhost:3000/admin
- 默认账号：admin@evershop.io / admin

### 5. 验证上传功能

上传图片后，检查日志：

```bash
docker logs evershop-app --tail 50 | grep -E "(AWS UPLOADER|UPLOAD FILE)"
```

成功的输出应该类似：

```
[UPLOAD FILE] file_storage config: s3
[UPLOAD FILE] Using S3 uploader (direct import)
[AWS UPLOADER] Starting S3 upload, endpoint: https://xxx.r2.cloudflarestorage.com
[AWS UPLOADER] Public base URL: https://your-domain.r2.dev
[AWS UPLOADER] Uploading: catalog/xxx/xxx/image.jpg to bucket: shop-s3
[AWS UPLOADER] Upload successful!
[AWS UPLOADER] File URL: https://your-domain.r2.dev/catalog/xxx/xxx/image.jpg
```

### 6. 停止服务

```bash
docker-compose down
```

### 技术细节

#### 应用的补丁（已固化到 Dockerfile）

1. **S3 扩展修复** (`patches/awsFileUploader.js`)
   - 移除 `getEnv` 依赖，直接使用 `process.env`
   - 添加自定义 endpoint 支持
   - 添加公共 URL 配置 (PUBLIC_ASSET_BASE_URL)

2. **上传服务修复** (`patches/uploadFile.js`)
   - 当 `file_storage` 设置为 `s3` 时，直接导入 S3 上传器
   - 添加详细的日志输出用于调试

3. **Schema 验证修复**
   - 允许 `file_storage` 值为 `s3`（默认只允许 `local`）

4. **Package.json 修复**
   - 为 S3 扩展添加 `main` 入口点

#### 为什么需要这些补丁？

EverShop 1.2.2 的 S3 扩展存在以下问题：

1. 不支持自定义 S3 兼容端点（如 Cloudflare R2）
2. 生成的 URL 是私有的，无法直接预览
3. 扩展加载机制在某些情况下不工作
4. Schema 验证不允许 S3 存储类型

所有补丁已通过 Dockerfile 固化到镜像中，**容器重启后配置保持一致**。

#### 文件持久化

- PostgreSQL 数据：存储在 Docker volume `postgres_data`
- 图片文件：存储在 Cloudflare R2 存储桶

### 本地测试常见问题

#### Q: 图片上传成功但无法预览？

A: 检查 `PUBLIC_ASSET_BASE_URL` 环境变量是否正确配置为 R2 公共域名。

#### Q: 容器重启后补丁丢失？

A: 所有补丁已固化在 Dockerfile 中。确保使用 `docker build` 构建的最新镜像。

#### Q: 如何修改 R2 配置？

A: 修改 `docker-compose.yml` 中的环境变量，然后运行 `docker-compose up -d` 重启容器。

## 相关文档

- [S3 存储配置指南](./S3_STORAGE_SETUP.md) - 详细的 S3 配置说明
- [EverShop 官方文档](https://evershop.io/docs/) - EverShop 官方文档
- [Fly.io 文档](https://fly.io/docs/) - Fly.io 平台文档

## 许可证

基于 EverShop 开源项目构建。
