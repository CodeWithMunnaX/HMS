const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

/**
 * Upload a memory buffer to Cloudinary or fallback to data-URI if not configured
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Folder name in Cloudinary (e.g. 'hms/doctors', 'hms/patients', 'hms/reports')
 * @param {string} resourceType - 'image', 'raw', 'auto'
 * @returns {Promise<{ url: string, public_id: string }>}
 */
const uploadToCloudinary = (buffer, folder = 'hms_uploads', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary keys are configured, perform direct upload via Cloudinary SDK
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
    ) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]:', error);
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
            format: result.format,
          });
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    } else {
      // Local fallback: Convert buffer to base64 Data URI so media works seamlessly without blocking
      const mime = 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${mime};base64,${base64Data}`;
      resolve({
        url: dataUri,
        public_id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        bytes: buffer.length,
        format: 'base64',
        isLocalFallback: true,
      });
    }
  });
};

/**
 * Delete a resource from Cloudinary
 * @param {string} publicId 
 * @returns {Promise<any>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    !publicId.startsWith('local_')
  ) {
    return await cloudinary.uploader.destroy(publicId);
  }
  return { result: 'ok', fallback: true };
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
