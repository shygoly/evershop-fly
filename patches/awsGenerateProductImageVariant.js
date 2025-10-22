import path from "path";
import sharp from "sharp";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getConfig } from "@evershop/evershop/lib/util/getConfig";
import { update } from "@evershop/postgres-query-builder";
import { pool } from "@evershop/evershop/lib/postgres";
import { error } from "@evershop/evershop/lib/log";

const bucketName = process.env.AWS_BUCKET_NAME;
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "auto",
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    forcePathStyle: true
});
const publicBase = process.env.PUBLIC_ASSET_BASE_URL || (process.env.AWS_ENDPOINT_URL_S3 ? `${process.env.AWS_ENDPOINT_URL_S3}/${bucketName}` : `https://${bucketName}.s3.amazonaws.com`);

function stripBucketFromKey(key) {
    // Normalize: if the key is like 'bucket/key', remove the leading 'bucket/'
    if (bucketName && key.startsWith(`${bucketName}/`)) {
        return key.slice(bucketName.length + 1);
    }
    return key;
}

async function downloadObjectToBuffer(objectUrl) {
    console.log("[AWS VARIANT] Downloading object:", objectUrl);

    // Extract the object key from the URL
    // Supports both host-style and path-style public URLs
    const parsedUrl = new URL(objectUrl);
    let objectKey = parsedUrl.pathname.substr(1); // Remove leading '/'
    objectKey = stripBucketFromKey(objectKey);

    console.log("[AWS VARIANT] Object key:", objectKey);
    console.log("[AWS VARIANT] Bucket:", bucketName);

    const params = {
        Bucket: bucketName,
        Key: objectKey,
    };

    const getObjectCommand = new GetObjectCommand(params);
    const data = await s3Client.send(getObjectCommand);

    // Get content as a buffer from the data.Body object
    const buffer = await data.Body?.transformToByteArray();
    return buffer;
}

async function resizeAndUploadImage(originalObjectUrl, resizedObjectKey, width, height) {
    console.log("[AWS VARIANT] Resizing image to", width, "x", height);

    const originalImageBuffer = await downloadObjectToBuffer(originalObjectUrl);

    // Resize the image
    const resizedImageBuffer = await sharp(originalImageBuffer)
        .resize({ width, height, fit: "inside" })
        .toBuffer();

    // Upload the resized image
    const uploadParams = {
        Bucket: bucketName,
        Key: resizedObjectKey,
        Body: resizedImageBuffer,
    };

    const uploadCommand = new PutObjectCommand(uploadParams);
    await s3Client.send(uploadCommand);

    const resizedObjectUrl = `${publicBase}/${resizedObjectKey}`;
    console.log("[AWS VARIANT] Uploaded variant:", resizedObjectUrl);

    return resizedObjectUrl;
}

export default async function awsGenerateProductImageVariant(data) {
    if (getConfig("system.file_storage") === "s3") {
        try {
            console.log("[AWS VARIANT] Generating variants for:", data.origin_image);

            const originalObjectUrl = data.origin_image;

            // Extract object key from the original URL
            const parsedUrl = new URL(originalObjectUrl);
            let originalKey = parsedUrl.pathname.substr(1);
            originalKey = stripBucketFromKey(originalKey);
            const ext = path.extname(originalKey);
            const keyWithoutExt = originalKey.replace(ext, '');

            // Target keys for variants
            const singleKey = `${keyWithoutExt}-single${ext}`;
            const listingKey = `${keyWithoutExt}-listing${ext}`;
            const thumbnailKey = `${keyWithoutExt}-thumbnail${ext}`;

            // Upload the single variant
            const singleUrl = await resizeAndUploadImage(
                originalObjectUrl,
                singleKey,
                getConfig("catalog.product.image.single.width", 500),
                getConfig("catalog.product.image.single.height", 500)
            );

            // Upload the listing variant
            const listingUrl = await resizeAndUploadImage(
                originalObjectUrl,
                listingKey,
                getConfig("catalog.product.image.listing.width", 250),
                getConfig("catalog.product.image.listing.height", 250)
            );

            // Upload the thumbnail variant
            const thumnailUrl = await resizeAndUploadImage(
                originalObjectUrl,
                thumbnailKey,
                getConfig("catalog.product.image.thumbnail.width", 100),
                getConfig("catalog.product.image.thumbnail.height", 100)
            );

            console.log("[AWS VARIANT] Updating database with variant URLs");

            // Update the record in the database with the new URLs in the variant columns
            await update("product_image")
                .given({
                    single_image: singleUrl,
                    listing_image: listingUrl,
                    thumb_image: thumnailUrl,
                })
                .where("product_image_product_id", "=", data.product_image_product_id)
                .and("origin_image", "=", data.origin_image)
                .execute(pool);

            console.log("[AWS VARIANT] Variants generated successfully");
        }
        catch (e) {
            console.error("[AWS VARIANT] Error generating variants:", e);
            error(e);
        }
    }
}
