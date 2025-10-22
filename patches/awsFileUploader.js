import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "auto",
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    forcePathStyle: true
});
const bucketName = process.env.AWS_BUCKET_NAME;
const publicBase = process.env.PUBLIC_ASSET_BASE_URL || (process.env.AWS_ENDPOINT_URL_S3 ? `${process.env.AWS_ENDPOINT_URL_S3}/${bucketName}` : `https://${bucketName}.s3.amazonaws.com`);

export const awsFileUploader = {
    upload: async (files, requestedPath) => {
        console.log("[AWS UPLOADER] Starting S3 upload, endpoint:", process.env.AWS_ENDPOINT_URL_S3);
        console.log("[AWS UPLOADER] Public base URL:", publicBase);
        const uploadedFiles = [];
        const uploadPromises = [];
        for (const file of files) {
            const fileName = requestedPath
                ? `${requestedPath}/${file.filename}`
                : file.filename;
            const fileContent = file.buffer;
            const params = {
                Bucket: bucketName,
                Key: fileName,
                Body: fileContent,
                ContentType: file.mimetype
            };
            console.log("[AWS UPLOADER] Uploading:", fileName, "to bucket:", bucketName);
            const uploadCommand = new PutObjectCommand(params);
            const uploadPromise = s3Client.send(uploadCommand);
            uploadPromises.push(uploadPromise);
        }

        try {
            const uploadResults = await Promise.all(uploadPromises);
            console.log("[AWS UPLOADER] Upload successful!");
            uploadResults.forEach((result, index) => {
                const filePath = requestedPath ? `${requestedPath}/${files[index].filename}` : files[index].filename;
                const fileUrl = `${publicBase}/${filePath}`;
                console.log("[AWS UPLOADER] File URL:", fileUrl);
                uploadedFiles.push({
                    name: files[index].filename,
                    mimetype: files[index].mimetype,
                    size: files[index].size,
                    url: fileUrl
                });
            });
        } catch (error) {
            console.error("[AWS UPLOADER] Upload failed:", error);
            throw error;
        }

        return uploadedFiles;
    },
};
