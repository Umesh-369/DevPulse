import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { purgeMockData } from '../scripts/cleanupDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('ℹ️ Auto-seeding of mock users has been permanently disabled.');
console.log('Running database cleanup to ensure no demo users exist...');

purgeMockData()
  .then(() => {
    console.log('✓ Database verification completed. No demo users present.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error verifying database:', err.message);
    process.exit(1);
  });
