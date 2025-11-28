// This file ensures environment variables are loaded before Next.js starts.
// It fixes the "GEMINI_API_KEY is missing" error.

const dotenv = require('dotenv');

// Load .env file
dotenv.config({ path: './.env' });

console.log("✅ Environment variables loaded via next-env.js");