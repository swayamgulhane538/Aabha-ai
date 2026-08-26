import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'PORT'] as const;
for (const envVar of requiredEnvs) {
  if (!process.env[envVar]) {
    console.warn(`Warning: Missing environment variable: ${envVar}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'secret123',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refreshsecret123',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
