import { User } from '@prisma/client';

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: User;
}