import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyGoogleToken, generateJWT } from '../services/googleAuth.js';
import { query } from '../config/database.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Google OAuth Sign-in
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential required' });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential);

    if (!googleUser.emailVerified) {
      return res.status(400).json({ error: 'Email not verified with Google' });
    }

    // Check if user exists
    let result = await query(
      'SELECT id, email, name, picture, created_at FROM users WHERE email = $1',
      [googleUser.email]
    );

    let user;
    if (result.rows.length === 0) {
      // Create new user
      const userId = uuidv4();
      const insertResult = await query(
        'INSERT INTO users (id, email, name, picture, google_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, picture, created_at',
        [userId, googleUser.email, googleUser.name, googleUser.picture, googleUser.googleId]
      );
      user = insertResult.rows[0];
      console.log(`✅ New user created: ${user.email}`);
    } else {
      // Update existing user
      user = result.rows[0];
      await query(
        'UPDATE users SET name = $1, picture = $2, google_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
        [googleUser.name, googleUser.picture, googleUser.googleId, user.id]
      );
      console.log(`✅ User updated: ${user.email}`);
    }

    // Generate JWT
    const token = generateJWT(user.id);

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user data
    res.status(200).json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Get current user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    // Get user with card information
    const result = await query(`
      SELECT 
        u.id, u.email, u.name, u.picture, u.created_at,
        c.id as card_id, c.public_id, c.image_url, c.metadata
      FROM users u
      LEFT JOIN cards c ON u.id = c.user_id
      WHERE u.id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = result.rows[0];
    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      createdAt: userData.created_at,
      card: userData.card_id ? {
        id: userData.card_id,
        publicId: userData.public_id,
        imageUrl: userData.image_url,
        metadata: userData.metadata,
      } : null,
    };

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Refresh token
router.post('/refresh', authenticateUser, async (req, res) => {
  try {
    // Generate new token
    const token = generateJWT(req.user.id);

    // Set new cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

export default router;
