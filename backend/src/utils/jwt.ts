import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
  patientId?: string;
  preferredLanguage?: string;
}

export const generateAccessToken = (user: JwtPayload): string => {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (user: JwtPayload): string => {
  return jwt.sign(user, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};
