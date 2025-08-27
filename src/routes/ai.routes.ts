import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

const router = Router();

// Get AI config
router.get('/config', authenticate, async (req: AuthRequest, res) => {
  try {
    const aiConfig = await prisma.aiConfig.findUnique({
      where: { userId: req.user!.userId },
    });
    res.json({ aiConfig });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI config' });
  }
});

// Update AI config
router.put('/config', authenticate, async (req: AuthRequest, res) => {
  const { personality, responseStyle, pricing, customResponses } = req.body;

  try {
    const aiConfig = await prisma.aiConfig.upsert({
      where: { userId: req.user!.userId },
      update: {
        personality,
        responseStyle,
        pricing,
        customResponses,
        updatedAt: new Date(),
      },
      create: {
        userId: req.user!.userId,
        personality: personality || {
          tone: 'friendly',
          style: 'engaging',
          traits: ['helpful', 'attentive'],
        },
        responseStyle: responseStyle || 'friendly',
        pricing: pricing || {
          photos: 10,
          videos: 25,
          custom: 50,
        },
        customResponses: customResponses || {
          greetings: ['Hey there! How are you today?'],
          sales_pitches: ['I have some exclusive content you might enjoy!'],
        },
      },
    });

    res.json({ 
      message: 'AI config updated successfully',
      aiConfig,
    });
  } catch (error) {
    console.error('AI config error:', error);
    res.status(500).json({ error: 'Failed to update AI config' });
  }
});

export default router;