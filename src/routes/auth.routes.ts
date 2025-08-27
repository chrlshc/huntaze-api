import { Router } from 'express';
import { googleAuth, googleCallback, refreshToken, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Token management
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);

// User info
router.get('/me', authenticate, getMe);

export default router;