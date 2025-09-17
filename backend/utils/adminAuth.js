import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// This will be used to hash admin password once and store it
export async function hashAdminPassword(plainPassword) {
  const saltRounds = 12; // Higher rounds for admin
  return await bcrypt.hash(plainPassword, saltRounds);
}

// Verify admin password
export async function verifyAdminPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Generate secure JWT secret if not provided
export function getJWTSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret === 'default_secret' || secret.length < 32) {
    console.error('WARNING: Weak or missing JWT_SECRET detected. Please set a strong JWT_SECRET in your .env file');
    // In production, this should throw an error
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production environment');
    }
  }

  return secret || 'development_only_secret_do_not_use_in_production';
}

// Create admin token with additional security
export function createAdminToken(username) {
  const secret = getJWTSecret();

  return jwt.sign(
    {
      username,
      role: 'admin',
      issuedAt: Date.now(),
      jti: Math.random().toString(36).substring(7) // JWT ID for token revocation
    },
    secret,
    {
      expiresIn: '12h', // Shorter expiry for admin tokens
      issuer: 'ielts-registration',
      audience: 'admin-panel'
    }
  );
}

// Verify admin token
export function verifyAdminToken(token) {
  const secret = getJWTSecret();

  return jwt.verify(token, secret, {
    issuer: 'ielts-registration',
    audience: 'admin-panel'
  });
}