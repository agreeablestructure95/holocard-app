import express from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Validation schema for profile data
const profileSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  title: Joi.string().max(100).allow(''),
  bio: Joi.string().max(500).allow(''),
  phone: Joi.string().max(20).allow(''),
  email: Joi.string().email().max(100).required(),
  website: Joi.string().uri().max(200).allow(''),
  linkedin: Joi.string().max(200).allow(''),
  twitter: Joi.string().max(200).allow(''),
  instagram: Joi.string().max(200).allow(''),
  facebook: Joi.string().max(200).allow(''),
});

// Get user profile
router.get('/', authenticateUser, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.email, u.name, u.picture, u.created_at,
        c.id as card_id, c.public_id, c.image_url, c.metadata, c.created_at as card_created_at
      FROM users u
      LEFT JOIN cards c ON u.id = c.user_id
      WHERE u.id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = result.rows[0];
    const profile = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      createdAt: userData.created_at,
      card: userData.card_id ? {
        id: userData.card_id,
        publicId: userData.public_id,
        imageUrl: userData.image_url,
        metadata: userData.metadata || {},
        createdAt: userData.card_created_at,
      } : null,
    };

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/', authenticateUser, async (req, res) => {
  try {
    // Validate input
    const { error, value } = profileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const {
      name,
      title,
      bio,
      phone,
      email,
      website,
      linkedin,
      twitter,
      instagram,
      facebook,
    } = value;

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const emailCheck = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    // Update user basic info
    await query(
      'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [name, email, req.user.id]
    );

    // Prepare metadata
    const metadata = {
      title: title || '',
      bio: bio || '',
      phone: phone || '',
      website: website || '',
      social: {
        linkedin: linkedin || '',
        twitter: twitter || '',
        instagram: instagram || '',
        facebook: facebook || '',
      },
    };

    // Check if user has a card
    const cardResult = await query(
      'SELECT id FROM cards WHERE user_id = $1',
      [req.user.id]
    );

    if (cardResult.rows.length === 0) {
      // Create new card
      const cardId = uuidv4();
      const publicId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await query(
        'INSERT INTO cards (id, user_id, public_id, metadata) VALUES ($1, $2, $3, $4)',
        [cardId, req.user.id, publicId, JSON.stringify(metadata)]
      );

      console.log(`✅ New card created for user: ${req.user.email}`);
    } else {
      // Update existing card
      await query(
        'UPDATE cards SET metadata = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        [JSON.stringify(metadata), req.user.id]
      );

      console.log(`✅ Card updated for user: ${req.user.email}`);
    }

    // Get updated profile
    const updatedResult = await query(`
      SELECT 
        u.id, u.email, u.name, u.picture, u.created_at,
        c.id as card_id, c.public_id, c.image_url, c.metadata, c.created_at as card_created_at
      FROM users u
      LEFT JOIN cards c ON u.id = c.user_id
      WHERE u.id = $1
    `, [req.user.id]);

    const userData = updatedResult.rows[0];
    const profile = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      createdAt: userData.created_at,
      card: userData.card_id ? {
        id: userData.card_id,
        publicId: userData.public_id,
        imageUrl: userData.image_url,
        metadata: userData.metadata || {},
        createdAt: userData.card_created_at,
      } : null,
    };

    res.status(200).json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update card image
router.put('/card-image', authenticateUser, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL required' });
    }

    // Update card image
    const result = await query(
      'UPDATE cards SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING id, public_id, image_url, metadata',
      [imageUrl, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const card = result.rows[0];

    res.status(200).json({
      message: 'Card image updated successfully',
      card: {
        id: card.id,
        publicId: card.public_id,
        imageUrl: card.image_url,
        metadata: card.metadata || {},
      },
    });
  } catch (error) {
    console.error('Update card image error:', error);
    res.status(500).json({ error: 'Failed to update card image' });
  }
});

export default router;
