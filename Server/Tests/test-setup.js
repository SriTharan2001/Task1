// Load environment variables for testing
const path = require('path');
const fs = require('fs');

// Try to load .env file if it exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  // Set default test environment variables
  console.log('No .env file found, using default test configuration');
}

// Ensure test database URI is set
if (!process.env.MONGO_URI_TEST) {
  process.env.MONGO_URI_TEST = 'mongodb://localhost:27017/expense-tracker-test';
}

// Ensure other required environment variables are set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key';
}

// Set test environment
process.env.NODE_ENV = 'test';

// Disable deprecated warnings for tests
process.env.MONGOOSE_DEPRECATION_WARNINGS = 'false';
