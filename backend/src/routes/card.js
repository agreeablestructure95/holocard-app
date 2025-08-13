import express from 'express';
import QRCode from 'qrcode';
import { query } from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get public card by public_id
router.get('/:publicId', optionalAuth, async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await query(`
      SELECT 
        c.id, c.public_id, c.image_url, c.metadata, c.created_at,
        u.name, u.email, u.picture
      FROM cards c
      JOIN users u ON c.user_id = u.id
      WHERE c.public_id = $1
    `, [publicId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const cardData = result.rows[0];
    const metadata = cardData.metadata || {};

    const card = {
      id: cardData.id,
      publicId: cardData.public_id,
      imageUrl: cardData.image_url,
      createdAt: cardData.created_at,
      user: {
        name: cardData.name,
        email: cardData.email,
        picture: cardData.picture,
      },
      profile: {
        title: metadata.title || '',
        bio: metadata.bio || '',
        phone: metadata.phone || '',
        website: metadata.website || '',
        social: metadata.social || {},
      },
    };

    res.status(200).json({ card });
  } catch (error) {
    console.error('Get public card error:', error);
    res.status(500).json({ error: 'Failed to get card' });
  }
});

// Generate QR code for card
router.get('/:publicId/qr', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { format = 'png', size = 256 } = req.query;

    // Verify card exists
    const cardResult = await query(
      'SELECT id FROM cards WHERE public_id = $1',
      [publicId]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Generate QR code URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const cardUrl = `${frontendUrl}/card/${publicId}`;

    // QR code options
    const qrOptions = {
      type: format === 'svg' ? 'svg' : 'png',
      width: Math.min(Math.max(parseInt(size), 64), 1024), // Limit size between 64 and 1024
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    if (format === 'svg') {
      const qrSvg = await QRCode.toString(cardUrl, { ...qrOptions, type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(qrSvg);
    } else {
      const qrBuffer = await QRCode.toBuffer(cardUrl, qrOptions);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="card-${publicId}-qr.png"`);
      res.send(qrBuffer);
    }
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Get card sharing info
router.get('/:publicId/share', async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await query(`
      SELECT 
        c.public_id, c.image_url,
        u.name, u.email
      FROM cards c
      JOIN users u ON c.user_id = u.id
      WHERE c.public_id = $1
    `, [publicId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const cardData = result.rows[0];
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const cardUrl = `${frontendUrl}/card/${publicId}`;
    const qrUrl = `${req.protocol}://${req.get('host')}/api/card/${publicId}/qr`;

    const shareInfo = {
      cardUrl,
      qrUrl,
      title: `${cardData.name}'s HoloCard`,
      description: `Check out ${cardData.name}'s interactive AR business card`,
      image: cardData.image_url,
    };

    res.status(200).json({ shareInfo });
  } catch (error) {
    console.error('Get share info error:', error);
    res.status(500).json({ error: 'Failed to get share information' });
  }
});

export default router;
