import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, (req, res) => {
  res.json({ message: 'User profile' });
});

export default router;