import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        resource_type: 'image',
        folder: 'holocard/cards',
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ],
        ...options,
      };

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
            });
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Failed to upload image');
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Image deletion failed:', error);
    throw new Error('Failed to delete image');
  }
};

export const generateSignedUrl = (publicId, options = {}) => {
  try {
    return cloudinary.url(publicId, {
      sign_url: true,
      type: 'authenticated',
      ...options,
    });
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
};

export default cloudinary;
