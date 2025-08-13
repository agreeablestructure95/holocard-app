import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      googleId: payload.sub,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
};

export const generateJWT = (userId) => {
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET);
};
