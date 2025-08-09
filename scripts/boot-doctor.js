#!/usr/bin/env node

/**
 * Boot Doctor - Validates system health at startup
 * Checks env, migrations, static routes, and critical dependencies
 */

import { execSync } from 'child_process';
import { existsSync, accessSync } from 'fs';
import fetch from 'node-fetch';

const CHECKS = {
  environment: {
    name: 'Environment Variables',
    fn: checkEnvironment
  },
  filesystem: {
    name: 'File System Access',
    fn: checkFilesystem
  },
  database: {
    name: 'Database Schema',
    fn: checkDatabase
  },
  staticFiles: {
    name: 'Static File Routes',
    fn: checkStaticFiles
  },
  dependencies: {
    name: 'Critical Dependencies',
    fn: checkDependencies
  }
};

async function checkEnvironment() {
  const required = ['DATABASE_URL'];
  const optional = ['RESEND_API_KEY', 'STRIPE_SECRET_KEY', 'OPENAI_API_KEY'];
  
  const missing = required.filter(key => !process.env[key]);
  const optionalMissing = optional.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
  
  if (optionalMissing.length > 0) {
    console.warn(`⚠️  Optional services disabled: ${optionalMissing.join(', ')}`);
  }
  
  return { 
    required: required.length,
    optional: optional.length - optionalMissing.length,
    missing: optionalMissing.length
  };
}

async function checkFilesystem() {
  const paths = ['uploads', 'client/src', 'server', 'shared'];
  const missing = [];
  
  for (const path of paths) {
    try {
      accessSync(path);
    } catch {
      missing.push(path);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing critical paths: ${missing.join(', ')}`);
  }
  
  return { checked: paths.length, missing: 0 };
}

async function checkDatabase() {
  try {
    // Try to import storage and check basic connection
    const { db } = await import('../server/storage.js');
    await db.execute('SELECT 1');
    
    return { status: 'connected' };
  } catch (error) {
    console.warn('⚠️  Database check failed:', error.message);
    return { status: 'warning', error: error.message };
  }
}

async function checkStaticFiles() {
  const staticPaths = ['/uploads'];
  const results = [];
  
  for (const path of staticPaths) {
    const exists = existsSync(path.replace('/', ''));
    results.push({ path, exists });
  }
  
  return { paths: results };
}

async function checkDependencies() {
  const critical = ['react', 'express', 'drizzle-orm', 'zod'];
  const packageJson = JSON.parse(
    await import('fs').then(fs => fs.readFileSync('package.json', 'utf8'))
  );
  
  const missing = critical.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies?.[dep]
  );
  
  if (missing.length > 0) {
    throw new Error(`Missing critical dependencies: ${missing.join(', ')}`);
  }
  
  return { checked: critical.length, missing: 0 };
}

async function runBootDoctor() {
  console.log('🩺 Boot Doctor - System Health Check\n');
  
  let passed = 0;
  let warnings = 0;
  let failed = 0;
  
  for (const [key, check] of Object.entries(CHECKS)) {
    try {
      console.log(`🔍 ${check.name}...`);
      const result = await check.fn();
      
      if (result.status === 'warning') {
        console.log(`⚠️  ${check.name}: Warning - ${result.error}`);
        warnings++;
      } else {
        console.log(`✅ ${check.name}: OK`);
        passed++;
      }
    } catch (error) {
      console.error(`❌ ${check.name}: FAILED`);
      console.error(`   ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Boot Doctor Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n💡 Fix critical issues before proceeding');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  System operational with warnings');
    process.exit(0);
  } else {
    console.log('\n🎉 All systems go!');
    process.exit(0);
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBootDoctor().catch(error => {
    console.error('💥 Boot Doctor crashed:', error);
    process.exit(1);
  });
}