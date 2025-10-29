const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - The uploaded image URL
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'news-website',
      resource_type: 'auto',
      transformation: options.transformation || [],
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Upload avatar image
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<string>} - The uploaded image URL
 */
const uploadAvatar = async (fileBuffer, userId) => {
  return await uploadToCloudinary(fileBuffer, {
    folder: `news-website/avatars/${userId}`,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  });
};

/**
 * Upload article image
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} articleId - Article ID for folder organization
 * @returns {Promise<string>} - The uploaded image URL
 */
const uploadArticleImage = async (fileBuffer, articleId = 'temp') => {
  return await uploadToCloudinary(fileBuffer, {
    folder: `news-website/articles/${articleId}`,
    transformation: [
      { width: 1200, height: 630, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - The Cloudinary image URL
 * @returns {Promise<Object>} - Deletion result
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public ID from URL
    const parts = imageUrl.split('/');
    const fileName = parts[parts.length - 1];
    const publicId = fileName.split('.')[0];
    const folder = parts.slice(parts.indexOf('news-website'), -1).join('/');
    const fullPublicId = `${folder}/${publicId}`;

    const result = await cloudinary.uploader.destroy(fullPublicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  uploadAvatar,
  uploadArticleImage,
  deleteFromCloudinary
};
