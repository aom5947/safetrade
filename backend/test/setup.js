import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test configuration
global.testConfig = {
  baseURL: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`,
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  timeout: 30000
};

// Test accounts for authentication
global.testAccounts = {
  superAdmin: {
    email: 'superadmin@marketplace.com',
    password: 'password123',
    role: 'super_admin'
  },
  admin: {
    email: 'admin@marketplace.com',
    password: 'password123',
    role: 'admin'
  },
  seller1: {
    email: 'seller1@test.com',
    password: 'password123',
    role: 'seller'
  },
  seller2: {
    email: 'seller2@test.com',
    password: 'password123',
    role: 'seller'
  },
  buyer1: {
    email: 'buyer1@test.com',
    password: 'password123',
    role: 'buyer'
  }
};

console.log('Test environment initialized');
console.log(`Base URL: ${global.testConfig.baseURL}${global.testConfig.apiPrefix}`);
