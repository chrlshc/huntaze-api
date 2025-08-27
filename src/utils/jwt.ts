import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;
// Accept values like "7d" or a numeric amount of seconds. Default: 7 days.
const JWT_EXPIRES_IN: StringValue | number =
  (process.env.JWT_EXPIRES_IN as StringValue | undefined) ?? 60 * 60 * 24 * 7;

export const generateToken = (payload: JWTPayload): string => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};
