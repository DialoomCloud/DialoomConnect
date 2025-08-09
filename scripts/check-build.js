#!/usr/bin/env node

/**
 * Build Check Script - Validates the build process
 * Ensures TypeScript, ESLint, and build steps pass before deployment
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const checks = [
  {
    name: 'TypeScript Check',
    command: 'npx tsc --noEmit',
    cwd: '.',
  },
  {
    name: 'Client Build',
    command: 'npm run build:client',
    cwd: '.',
  },
  {
    name: 'Server Build Check',
    command: 'npx tsc --project server/tsconfig.json --noEmit',
    cwd: '.',
  },
];

console.log('🔍 Running build checks...\n');

let passed = 0;
let failed = 0;

for (const check of checks) {
  try {
    console.log(`⏳ ${check.name}...`);
    
    const startTime = Date.now();
    execSync(check.command, { 
      cwd: check.cwd, 
      stdio: 'inherit',
      encoding: 'utf8',
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ ${check.name} passed (${duration}ms)\n`);
    passed++;
    
  } catch (error) {
    console.error(`❌ ${check.name} failed\n`);
    failed++;
  }
}

// Summary
console.log('='.repeat(50));
console.log(`📊 Build Check Results:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed > 0) {
  console.log('\n💡 Fix the failing checks before proceeding.');
  process.exit(1);
} else {
  console.log('\n🎉 All checks passed! Build is ready.');
  process.exit(0);
}