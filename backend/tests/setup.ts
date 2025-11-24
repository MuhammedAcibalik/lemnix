console.log("🔍 [SETUP] Setup dosyası yükleniyor...");
import { beforeAll, afterAll } from 'vitest';
console.log("🔍 [SETUP] Vitest imported");
import dotenv from 'dotenv';
import path from 'path';
console.log("🔍 [SETUP] Dependencies imported");

// Load test environment variables
const envPath = path.join(__dirname, '..', '.env.test');
console.log(`🔍 [SETUP] Loading .env.test from: ${envPath}`);
dotenv.config({ path: envPath });
console.log("🔍 [SETUP] dotenv.config completed");

beforeAll(async () => {
  console.log("🔍 [SETUP] beforeAll başladı");
  // Setup test environment
  process.env.NODE_ENV = 'test';
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./test.db';
  }
  console.log("🔍 [SETUP] beforeAll tamamlandı");
});

afterAll(async () => {
  // Cleanup
});
