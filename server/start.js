#!/usr/bin/env node

/**
 * Production Server Startup
 * Uses compiled JavaScript with proper error handling and health checks
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ESM compatibility for __dirname
global.__dirname = __dirname;

async function startServer() {
  try {
    console.log('🚀 Starting production server...');
    
    // Import and start the main server
    const { default: app } = await import('./index.js');
    
    console.log('✅ Server started successfully');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

startServer();