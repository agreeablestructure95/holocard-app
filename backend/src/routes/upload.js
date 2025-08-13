import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { uploadImage, deleteImage } from '../services/cloudinary.js';
import cloudinary from '../services/cloudinary.js';
import { authenticateUser } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Upload card image
router.post('/card-image', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Image upload request received for user:', req.user?.email);
    
    if (!req.file) {
      console.log('❌ No file provided in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('📁 File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Check if user has an existing card with image
    const existingCard = await query(
      'SELECT image_url, metadata FROM cards WHERE user_id = $1',
      [req.user.id]
    );

    let oldImageUrl = null;
    if (existingCard.rows.length > 0 && existingCard.rows[0].image_url) {
      oldImageUrl = existingCard.rows[0].image_url;
      console.log('🔄 Found existing image to replace:', oldImageUrl);
    }

    console.log('☁️ Uploading to Cloudinary...');
    // Upload new image to Cloudinary
    const uploadResult = await uploadImage(req.file.buffer, {
      folder: `holocard/users/${req.user.id}`,
      public_id: `card-${Date.now()}`,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ],
    });

    console.log('✅ Cloudinary upload successful:', uploadResult.url);

    // Check if user has a card, create one if not
    let cardResult = await query(
      'SELECT id, public_id FROM cards WHERE user_id = $1',
      [req.user.id]
    );

    if (cardResult.rows.length === 0) {
      // Create new card with image
      const cardId = uuidv4();
      const publicId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await query(
        'INSERT INTO cards (id, user_id, public_id, image_url, metadata) VALUES ($1, $2, $3, $4, $5)',
        [cardId, req.user.id, publicId, uploadResult.url, JSON.stringify({})]
      );
      
      console.log('🔄 New card created with image for user:', req.user.email);
    } else {
      // Update existing card with new image
      await query(
        'UPDATE cards SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        [uploadResult.url, req.user.id]
      );
      
      console.log('🔄 Card image updated for user:', req.user.email);
    }

    // Delete old image from Cloudinary if it exists
    if (oldImageUrl) {
      try {
        // Extract public ID from old URL
        const urlParts = oldImageUrl.split('/');
        const fileWithExtension = urlParts[urlParts.length - 1];
        const publicId = `holocard/users/${req.user.id}/${fileWithExtension.split('.')[0]}`;
        await deleteImage(publicId);
        console.log(`🗑️ Old image deleted: ${publicId}`);
      } catch (deleteError) {
        console.error('Failed to delete old image:', deleteError);
        // Don't fail the upload if old image deletion fails
      }
    }

    console.log(`✅ Card image uploaded for user: ${req.user.email}`);

    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: uploadResult.url,
      imageData: {
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      },
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    console.error('Error stack:', error.stack);
    
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 10MB' });
    }
    
    // Check for Cloudinary errors
    if (error.message && error.message.includes('cloudinary')) {
      return res.status(500).json({ 
        error: 'Image service temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Check for database errors
    if (error.code && error.code.startsWith('23')) { // PostgreSQL constraint violations
      return res.status(500).json({ 
        error: 'Database constraint error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete card image
router.delete('/card-image', authenticateUser, async (req, res) => {
  try {
    // Get current image URL
    const result = await query(
      'SELECT image_url FROM cards WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const imageUrl = result.rows[0].image_url;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'No image to delete' });
    }

    // Remove image URL from database
    await query(
      'UPDATE cards SET image_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [req.user.id]
    );

    // Delete image from Cloudinary
    try {
      const urlParts = imageUrl.split('/');
      const fileWithExtension = urlParts[urlParts.length - 1];
      const publicId = `holocard/users/${req.user.id}/${fileWithExtension.split('.')[0]}`;
      await deleteImage(publicId);
      console.log(`🗑️ Image deleted: ${publicId}`);
    } catch (deleteError) {
      console.error('Failed to delete image from Cloudinary:', deleteError);
      // Continue anyway since we've removed it from the database
    }

    console.log(`✅ Card image deleted for user: ${req.user.email}`);

    res.status(200).json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Get upload signature for direct client upload (optional)
router.post('/signature', authenticateUser, async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `holocard/users/${req.user.id}`;
    
    // This would generate a signature for direct upload to Cloudinary
    // Useful for large files or client-side upload flows
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        transformation: 'w_1200,h_800,c_limit,q_auto:good,f_auto',
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({ error: 'Failed to generate upload signature' });
  }
});

export default router;
