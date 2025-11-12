import { config } from 'dotenv';

// Load environment variables
config();

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
    'Please create a .env file based on .env.example'
  );
}

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress logs:
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
};
