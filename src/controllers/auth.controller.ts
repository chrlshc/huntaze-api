import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const FRONTEND_URL = process.env.FRONTEND_URL!;

export const googleAuth = (req: Request, res: Response) => {
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`;
  
  res.redirect(authUrl);
};

export const googleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/join?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    type GoogleTokens = {
      access_token: string;
      refresh_token?: string;
      id_token?: string;
      expires_in?: number;
      token_type?: string;
      scope?: string;
    };

    const tokens = (await tokenResponse.json()) as GoogleTokens;

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    type GoogleUser = {
      id: string;
      email: string;
      name: string;
      picture?: string;
      verified_email?: boolean;
    };

    const googleUser = (await userResponse.json()) as GoogleUser;

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email: googleUser.email },
      update: {
        name: googleUser.name,
        avatar: googleUser.picture,
        lastLoginAt: new Date(),
      },
      create: {
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture,
        googleId: googleUser.id,
      },
    });

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Check if user needs onboarding
    const hasSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    const redirectPath = hasSubscription ? '/dashboard' : '/onboarding';

    // Redirect with token
    res.redirect(`${FRONTEND_URL}${redirectPath}?token=${token}`);
  } catch (error) {
    console.error('OAuth error:', error);
    res.redirect(`${FRONTEND_URL}/join?error=oauth_failed`);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  // TODO: Implement refresh token logic
  res.json({ message: 'Not implemented' });
};

export const logout = async (req: AuthRequest, res: Response) => {
  // In a real app, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
};
