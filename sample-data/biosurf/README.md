# BioSurf 主题示例产品数据

该目录提供了与 BioSurf 主题设计稿相匹配的示例产品清单与矢量占位图。可以用于在 EverShop 管理后台 (`/admin`) 中快速创建 Demo 数据。

## 目录结构

```
sample-data/biosurf/
├── README.md
├── products.json              # 产品基础信息（名称、SKU、价格、标签等）
└── images/                    # 对应的矢量产品图，占位使用
    ├── bio-enzyme-cleaning-agent.svg
    ├── bio-active-serum.svg
    ├── cellular-renewal-cream.svg
    ├── hydro-boosting-cleanser.svg
    ├── bio-active-laundry-detergent.svg
    ├── all-purpose-surface-spray.svg
    ├── natural-glass-cleaner.svg
    ├── concentrated-refill-pouch.svg
    ├── anti-gapdh-antibody.svg
    ├── pcr-master-mix.svg
    ├── human-il6-elisa-kit.svg
    ├── bsa-bovine-serum.svg
    ├── dmem-high-glucose.svg
    ├── protein-ag-agarose.svg
    ├── human-epidermal-keratinocytes.svg
    ├── crispr-cas9-kit.svg
    └── human-egf.svg
```

## 导入建议流程

1. **登录后台**：访问 `http://<你的域名或 localhost>:3000/admin`，使用管理员账号登录。
2. **创建分类（可选）**：根据 `tags` 创建如 “Clinical Skincare”“Research”“Facility Care” 等分类，方便后续关联。
3. **新增产品**：
   - 在后台选择 “Catalog → Products → Add New Product”。
   - 根据 `products.json` 中的字段填写名称、SKU、价格、简短描述等信息。
   - 在 “Media” 区块上传 `images/` 目录下对应的 SVG 图片。
   - 设置状态为 `Published` 并保存。
4. **批量导入（可选）**：如果需要自动化，可以使用 EverShop GraphQL API：
   - 参考 `products.json` 构造 `catalogCreateProduct` Mutation。
   - 使用管理员 Token 对 `/api/graphql` 发送请求，并在上传图片前将 SVG 文件上传至 S3（或配置好的对象存储）。
   - 上传成功后，将返回的文件 URL 绑定到产品的媒体字段。
5. **校验前台展示**：切换至前台站点，确认产品卡片、详情页与 BioSurf 主题的视觉风格一致。

> 提示：SVG 占位图以主题的色彩体系绘制，可直接作为示例图片使用。若已有真实素材，也可以用同名文件替换后再上传。

## 自定义与扩展

- 可以在 `products.json` 中加入更多字段（如库存、属性、分类 ID），与 EverShop GraphQL Schema 对齐后再进行批量导入。
- 也可以编写脚本遍历该 JSON，调用 EverShop REST/GraphQL API 实现一键导入，确保在脚本中处理好授权与媒体文件上传。
