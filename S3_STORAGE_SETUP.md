# S3 兼容存储配置指南

本文档说明如何为部署在 Fly.io 上的 EverShop 配置 S3 兼容的对象存储服务。

## 前提条件

- EverShop 已部署到 Fly.io
- 已安装 Fly.io CLI 并登录
- 应用名称：`evershop-fly`（根据实际情况修改）

## 支持的 S3 兼容存储提供商

### 1. Cloudflare R2（推荐）

**优势**：
- ✅ 免费额度：10GB 存储
- ✅ 零出站流量费用
- ✅ S3 API 完全兼容
- ✅ 全球 CDN 加速

**设置步骤**：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 R2 Object Storage
3. 创建新的 bucket（例如：`evershop-media`）
4. 生成 API Token：
   - 点击 "Manage R2 API Tokens"
   - 创建新 token，选择 "Read & Write" 权限
   - 记录 Access Key ID 和 Secret Access Key

5. 获取 Endpoint URL（格式类似）：
   ```
   https://<account_id>.r2.cloudflarestorage.com
   ```

6. 设置 Fly.io secrets：
   ```bash
   fly secrets set \
     AWS_ACCESS_KEY_ID="your_r2_access_key_id" \
     AWS_SECRET_ACCESS_KEY="your_r2_secret_access_key" \
     AWS_REGION="auto" \
     AWS_BUCKET_NAME="evershop-media" \
     AWS_ENDPOINT_URL_S3="https://<account_id>.r2.cloudflarestorage.com" \
     -a evershop-fly
   ```

### 2. Backblaze B2

**优势**：
- ✅ 免费 10GB 存储
- ✅ 免费出站流量（最高为存储量的 3 倍）
- ✅ 价格低廉（$0.006/GB/月）

**设置步骤**：

1. 登录 [Backblaze](https://www.backblaze.com/)
2. 创建新的 B2 bucket
3. 生成 Application Key：
   - 进入 "App Keys"
   - 创建新的 key
   - 记录 keyID 和 applicationKey

4. 获取 Endpoint URL（根据区域）：
   ```
   https://s3.us-west-004.backblazeb2.com
   ```

5. 设置 Fly.io secrets：
   ```bash
   fly secrets set \
     AWS_ACCESS_KEY_ID="your_b2_key_id" \
     AWS_SECRET_ACCESS_KEY="your_b2_application_key" \
     AWS_REGION="us-west-004" \
     AWS_BUCKET_NAME="your-bucket-name" \
     AWS_ENDPOINT_URL_S3="https://s3.us-west-004.backblazeb2.com" \
     -a evershop-fly
   ```

### 3. Wasabi

**优势**：
- ✅ 无出站流量费用
- ✅ 无 API 调用费用
- ✅ 简单定价：$5.99/月（1TB 起步）

**设置步骤**：

1. 登录 [Wasabi Console](https://console.wasabisys.com/)
2. 创建新的 bucket
3. 生成 Access Keys：
   - 进入 "Access Keys"
   - 创建新的 access key
   - 记录 Access Key 和 Secret Key

4. 根据 bucket 区域设置 endpoint（例如：us-east-1）：
   ```
   https://s3.us-east-1.wasabisys.com
   ```

5. 设置 Fly.io secrets：
   ```bash
   fly secrets set \
     AWS_ACCESS_KEY_ID="your_wasabi_access_key" \
     AWS_SECRET_ACCESS_KEY="your_wasabi_secret_key" \
     AWS_REGION="us-east-1" \
     AWS_BUCKET_NAME="your-bucket-name" \
     AWS_ENDPOINT_URL_S3="https://s3.us-east-1.wasabisys.com" \
     -a evershop-fly
   ```

### 4. AWS S3（标准）

**设置步骤**：

1. 登录 AWS Console
2. 创建 S3 bucket
3. 创建 IAM 用户并授予 S3 访问权限
4. 生成 Access Key

5. 设置 Fly.io secrets（无需 endpoint）：
   ```bash
   fly secrets set \
     AWS_ACCESS_KEY_ID="your_aws_access_key" \
     AWS_SECRET_ACCESS_KEY="your_aws_secret_key" \
     AWS_REGION="us-east-1" \
     AWS_BUCKET_NAME="your-bucket-name" \
     -a evershop-fly
   ```

### 5. DigitalOcean Spaces

**优势**：
- ✅ $5/月（250GB 存储 + 1TB 流量）
- ✅ S3 兼容 API

**设置步骤**：

1. 登录 DigitalOcean
2. 创建新的 Space
3. 生成 Spaces access key

4. Endpoint 格式：
   ```
   https://<region>.digitaloceanspaces.com
   ```

5. 设置 Fly.io secrets：
   ```bash
   fly secrets set \
     AWS_ACCESS_KEY_ID="your_spaces_key" \
     AWS_SECRET_ACCESS_KEY="your_spaces_secret" \
     AWS_REGION="nyc3" \
     AWS_BUCKET_NAME="your-space-name" \
     AWS_ENDPOINT_URL_S3="https://nyc3.digitaloceanspaces.com" \
     -a evershop-fly
   ```

## 部署步骤

### 1. 验证配置

查看已设置的 secrets：
```bash
fly secrets list -a evershop-fly
```

确认包含以下环境变量：
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_BUCKET_NAME`
- `AWS_ENDPOINT_URL_S3`（对于非 AWS S3 的服务）

### 2. 部署应用

```bash
cd /path/to/evershop-fly
fly deploy -a evershop-fly
```

### 3. 验证部署

查看应用日志：
```bash
fly logs -a evershop-fly
```

### 4. 测试文件上传

1. 访问应用后台：`https://evershop-fly.fly.dev/admin`
2. 尝试上传产品图片或其他媒体文件
3. 检查文件是否成功上传到 S3 存储

## 故障排查

### 检查环境变量

SSH 进入容器查看环境变量：
```bash
fly ssh console -a evershop-fly
env | grep AWS
```

### 查看应用日志

```bash
fly logs -a evershop-fly
```

常见错误：
- `Access Denied`: 检查 access key 和 secret key 是否正确
- `NoSuchBucket`: 检查 bucket 名称是否正确
- `InvalidAccessKeyId`: 检查 access key 是否有效
- `SignatureDoesNotMatch`: 检查 secret key 是否正确

### 测试 S3 连接

SSH 进入容器后，可以使用 AWS CLI 测试连接：
```bash
fly ssh console -a evershop-fly

# 测试列出 bucket（需要先安装 aws-cli）
npm install -g aws-cli
aws s3 ls --endpoint-url=$AWS_ENDPOINT_URL_S3
```

## 配置公共访问（可选）

为了让上传的图片可以被公开访问，需要配置 bucket 的公共访问策略：

### Cloudflare R2
1. 在 R2 bucket 设置中，配置 Public Access
2. 或使用 Custom Domain 绑定自定义域名

### Backblaze B2
1. 在 bucket 设置中，设置为 Public
2. 使用 Backblaze 提供的 URL 或配置 CloudFlare CDN

### 其他服务
参考各服务提供商的文档配置公共访问策略

## 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `AWS_ACCESS_KEY_ID` | S3 访问密钥 ID | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | S3 访问密钥 | `wJalr...` |
| `AWS_REGION` | S3 区域 | `us-east-1` / `auto` |
| `AWS_BUCKET_NAME` | S3 bucket 名称 | `evershop-media` |
| `AWS_ENDPOINT_URL_S3` | S3 endpoint URL（可选，非 AWS S3 必需） | `https://xxx.r2.cloudflarestorage.com` |

## 成本对比

| 提供商 | 存储费用 | 出站流量费用 | 免费额度 |
|--------|----------|--------------|----------|
| **Cloudflare R2** | $0.015/GB/月 | **免费** | 10GB 存储 |
| **Backblaze B2** | $0.006/GB/月 | **前 3x 免费** | 10GB 存储 |
| **Wasabi** | $5.99/月 (1TB) | **免费** | 无 |
| **AWS S3** | $0.023/GB/月 | $0.09/GB | 5GB (12个月) |
| **DigitalOcean Spaces** | $5/月 (250GB) | 1TB 流量 | 无 |

**推荐**：对于中小型电商网站，推荐使用 **Cloudflare R2** 或 **Backblaze B2**，可获得免费额度且无出站流量费用。

## 注意事项

1. **安全性**：不要将 access key 提交到版本控制系统
2. **区域选择**：建议选择与 Fly.io 应用相近的区域以降低延迟
3. **Bucket 权限**：确保 bucket 配置了适当的访问策略
4. **CORS 设置**：如果需要前端直接上传，需要配置 CORS 策略
5. **备份**：定期备份重要数据

## 相关资源

- [EverShop 官方文档](https://evershop.io/docs/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Backblaze B2 文档](https://www.backblaze.com/b2/docs/)
- [Wasabi 文档](https://wasabi-support.zendesk.com/)
- [Fly.io Secrets 管理](https://fly.io/docs/reference/secrets/)
