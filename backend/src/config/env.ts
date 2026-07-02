import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const required = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'];
const missing: string[] = [];

for (const key of required) {
  if (!process.env[key]) {
    missing.push(key);
  }
}

if (missing.length > 0) {
  const msg = `Fehlende Umgebungsvariablen: ${missing.join(', ')}. Bitte .env prüfen (siehe .env.example).`;
  console.error(`\x1b[31m${msg}\x1b[0m`);
  process.exit(1);
}

if (process.env.JWT_SECRET === 'fallback-secret-key') {
  console.warn('\x1b[33mWARNUNG: JWT_SECRET verwendet unsicheren Fallback. In Produktion ändern!\x1b[0m');
}

const PORT = parseInt(process.env.PORT || '4001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const DATABASE_URL = process.env.DATABASE_URL!;
const JWT_SECRET = process.env.JWT_SECRET!;

export { PORT, NODE_ENV, FRONTEND_URL, DATABASE_URL, JWT_SECRET };
