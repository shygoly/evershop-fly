import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "auto",
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    forcePathStyle: true
});
const bucketName = process.env.AWS_BUCKET_NAME;
const publicBase = process.env.PUBLIC_ASSET_BASE_URL || (process.env.AWS_ENDPOINT_URL_S3 ? `${process.env.AWS_ENDPOINT_URL_S3}/${bucketName}` : `https://${bucketName}.s3.amazonaws.com`);

export const awsFileBrowser = {
    list: async (path) => {
        console.log("[AWS BROWSER] Listing files in path:", path);
        console.log("[AWS BROWSER] Public base URL:", publicBase);

        if (path !== "") {
            path = `${path}/`;
        }
        // Keep only one slash at the end of the path
        path = path.replace(/\/{2,}$/, "/");
        const params = {
            Bucket: bucketName,
            Prefix: path,
            Delimiter: "/",
        };
        const listObjectsCommand = new ListObjectsV2Command(params);
        const data = await s3Client.send(listObjectsCommand);
        const subfolders = data.CommonPrefixes
            ? data.CommonPrefixes.map((commonPrefix) => { var _a; return (_a = commonPrefix.Prefix) === null || _a === void 0 ? void 0 : _a.replace(path, "").replace(/\/$/, ""); }).filter((prefix) => prefix !== "")
            : [];
        const files = data.Contents
            ? data.Contents.filter((item) => item.Size !== 0).map((object) => {
                var _a;
                const fileName = (_a = object.Key) === null || _a === void 0 ? void 0 : _a.split("/").pop();
                const fileURL = `${publicBase}/${object.Key}`;
                console.log("[AWS BROWSER] File URL:", fileURL);
                return {
                    name: fileName,
                    url: fileURL,
                };
            })
            : [];
        return {
            folders: Array.from(subfolders),
            files,
        };
    },
};
