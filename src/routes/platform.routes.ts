import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import crypto from 'crypto';

const router = Router();

// Get user's platforms
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const platforms = await prisma.platform.findMany({
      where: { userId: req.user!.userId },
      select: {
        id: true,
        type: true,
        username: true,
        active: true,
        lastSyncAt: true,
        createdAt: true,
      },
    });
    res.json({ platforms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

// Connect OnlyFans
router.post('/onlyfans/connect', authenticate, async (req: AuthRequest, res) => {
  const { username, apiKey } = req.body;

  if (!username || !apiKey) {
    return res.status(400).json({ error: 'Username and API key required' });
  }

  try {
    // Encrypt the API key before storing
    const encryptedKey = encrypt(apiKey);

    const platform = await prisma.platform.upsert({
      where: {
        userId_type: {
          userId: req.user!.userId,
          type: 'ONLYFANS',
        },
      },
      update: {
        username,
        accessToken: encryptedKey,
        active: true,
        lastSyncAt: new Date(),
      },
      create: {
        userId: req.user!.userId,
        type: 'ONLYFANS',
        username,
        accessToken: encryptedKey,
        active: true,
      },
    });

    res.json({ 
      message: 'OnlyFans connected successfully',
      platform: {
        id: platform.id,
        type: platform.type,
        username: platform.username,
        active: platform.active,
      },
    });
  } catch (error) {
    console.error('Platform connection error:', error);
    res.status(500).json({ error: 'Failed to connect platform' });
  }
});

// Connect Fansly
router.post('/fansly/connect', authenticate, async (req: AuthRequest, res) => {
  const { username, apiKey } = req.body;

  if (!username || !apiKey) {
    return res.status(400).json({ error: 'Username and API key required' });
  }

  try {
    // Encrypt the API key before storing
    const encryptedKey = encrypt(apiKey);

    const platform = await prisma.platform.upsert({
      where: {
        userId_type: {
          userId: req.user!.userId,
          type: 'FANSLY',
        },
      },
      update: {
        username,
        accessToken: encryptedKey,
        active: true,
        lastSyncAt: new Date(),
      },
      create: {
        userId: req.user!.userId,
        type: 'FANSLY',
        username,
        accessToken: encryptedKey,
        active: true,
      },
    });

    res.json({ 
      message: 'Fansly connected successfully',
      platform: {
        id: platform.id,
        type: platform.type,
        username: platform.username,
        active: platform.active,
      },
    });
  } catch (error) {
    console.error('Platform connection error:', error);
    res.status(500).json({ error: 'Failed to connect platform' });
  }
});

// Disconnect platform
router.delete('/:platformId', authenticate, async (req: AuthRequest, res) => {
  const { platformId } = req.params;

  try {
    await prisma.platform.delete({
      where: {
        id: platformId,
        userId: req.user!.userId,
      },
    });

    res.json({ message: 'Platform disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect platform' });
  }
});

// Simple encryption functions (in production, use proper encryption)
function encrypt(text: string): string {
  const algorithm = 'aes-256-ctr';
  const secretKey = process.env.JWT_SECRET || 'your-secret-key';
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(hash: string): string {
  const algorithm = 'aes-256-ctr';
  const secretKey = process.env.JWT_SECRET || 'your-secret-key';
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  
  const [ivHex, encrypted] = hash.split(':');
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);

  return decrypted.toString();
}

export default router;