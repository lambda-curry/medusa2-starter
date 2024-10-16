import dotenv from 'dotenv';

export const loadEnv = () => {
  const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
  dotenv.config({ path: envFile });
  dotenv.config({ path: '.env.local' });
  dotenv.config({ path: '.env' });
};
