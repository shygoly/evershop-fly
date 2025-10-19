const path = require('path');
const fs = require('fs').promises;
const { CONSTANTS } = require('@evershop/evershop/src/lib/helpers');
const { getConfig } = require('@evershop/evershop/src/lib/util/getConfig');
const { getValueSync } = require('@evershop/evershop/src/lib/util/registry');
const { buildUrl } = require('@evershop/evershop/src/lib/router/buildUrl');

/**
 * @param {Array} files an array of files in the format of {name: String, data: Buffer}
 * @param {String} destinationPath the destination path
 */
module.exports.uploadFile = async (files, destinationPath) => {
  const fileStorageConfig = getConfig('system.file_storage');
  console.log('[UPLOAD FILE] file_storage config:', fileStorageConfig);

  // Direct import for S3 uploader as temporary workaround
  if (fileStorageConfig === 's3') {
    console.log('[UPLOAD FILE] Using S3 uploader (direct import)');
    try {
      const { awsFileUploader } = await import('/app/node_modules/@evershop/s3_file_storage/dist/services/awsFileUploader.js');
      const results = await awsFileUploader.upload(files, destinationPath);
      console.log('[UPLOAD FILE] S3 Upload results:', results);
      return results;
    } catch (error) {
      console.error('[UPLOAD FILE] S3 upload failed, falling back to local:', error.message);
    }
  }

  // Fallback to registry-based lookup
  /**
   * @type {Object} uploader
   * @property {Function} upload
   */
  const fileUploader = getValueSync(
    'fileUploader',
    localUploader,
    {
      config: fileStorageConfig
    },
    (value) =>
      // The value must be an object with an upload method
      value && typeof value.upload === 'function'
  );

  console.log('[UPLOAD FILE] Using uploader:', fileUploader === localUploader ? 'localUploader' : 'registry uploader');

  const results = await fileUploader.upload(files, destinationPath);
  console.log('[UPLOAD FILE] Upload results:', results);
  return results;
};

const localUploader = {
  upload: async (files, destinationPath) => {
    // Assumming the we are using MemoryStorage for multer. Now we need to write the files to disk.
    // The files argument is an array of files from multer.
    const mediaPath = CONSTANTS.MEDIAPATH;
    const destination = path.join(mediaPath, destinationPath);
    // Create the destination folder if it does not exist
    await fs.mkdir(destination, { recursive: true });
    // Save the files to disk asynchrously
    const results = await Promise.all(
      files.map((file) =>
        fs
          .writeFile(path.join(destination, file.filename), file.buffer)
          .then(() => ({
            name: file.filename,
            type: file.minetype,
            size: file.size,
            url: buildUrl('staticAsset', [
              path
                .join(destinationPath, file.filename)
                .split('\\')
                .join('/')
                .replace(/^\//, '')
            ])
          }))
      )
    );
    return results;
  }
};
