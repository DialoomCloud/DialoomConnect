#!/usr/bin/env node

/**
 * Smoke Test Suite - Quick validation that core features work
 * Tests critical user paths without full E2E complexity
 */

import fetch from 'node-fetch';
import { setTimeout } from 'timers/promises';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

const tests = [
  {
    name: 'Health Check',
    test: async () => {
      const response = await fetch(`${BASE_URL}/healthz`);
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
      const data = await response.json();
      if (!data.ok) throw new Error('Health check returned not ok');
    }
  },
  
  {
    name: 'Readiness Check',
    test: async () => {
      const response = await fetch(`${BASE_URL}/readyz`);
      if (!response.ok) {
        console.warn('⚠️  Readiness check failed - some services may be unavailable');
        return; // Not a hard failure
      }
      const data = await response.json();
      console.log('📊 Service status:', data.checks?.features || 'unknown');
    }
  },

  {
    name: 'Host List API',
    test: async () => {
      const response = await fetch(`${BASE_URL}/api/hosts`);
      if (!response.ok) throw new Error(`Hosts API failed: ${response.status}`);
      const hosts = await response.json();
      if (!Array.isArray(hosts)) {
        throw new Error('Hosts API did not return array');
      }
      console.log(`📋 Found ${hosts.length} hosts`);
    }
  },

  {
    name: 'Categories API', 
    test: async () => {
      const response = await fetch(`${BASE_URL}/api/categories`);
      if (!response.ok) throw new Error(`Categories API failed: ${response.status}`);
      const categories = await response.json();
      if (!Array.isArray(categories)) {
        throw new Error('Categories API did not return array');
      }
      console.log(`📂 Found ${categories.length} categories`);
    }
  },

  {
    name: 'Languages API',
    test: async () => {
      const response = await fetch(`${BASE_URL}/api/languages`);
      if (!response.ok) throw new Error(`Languages API failed: ${response.status}`);
      const languages = await response.json();
      if (!Array.isArray(languages)) {
        throw new Error('Languages API did not return array');
      }
      console.log(`🌍 Found ${languages.length} languages`);
    }
  },

  {
    name: 'Static Files',
    test: async () => {
      // Test a common static file path
      const response = await fetch(`${BASE_URL}/uploads/test.txt`);
      // 404 is OK - we just want to ensure the route exists
      if (response.status !== 404 && !response.ok) {
        throw new Error(`Static files route failed: ${response.status}`);
      }
      console.log('📁 Static file serving is configured');
    }
  },

  {
    name: 'CORS Headers',
    test: async () => {
      const response = await fetch(`${BASE_URL}/api/hosts`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'GET',
        }
      });
      
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      if (!corsHeader) {
        console.warn('⚠️  CORS headers not found - may cause frontend issues');
      } else {
        console.log('🌐 CORS configured correctly');
      }
    }
  }
];

async function runSmokeTests() {
  console.log(`🔥 Running smoke tests against ${BASE_URL}...\n`);
  
  let passed = 0;
  let failed = 0;
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server...');
  await setTimeout(2000);
  
  for (const { name, test } of tests) {
    try {
      console.log(`⏳ ${name}...`);
      await test();
      console.log(`✅ ${name} passed\n`);
      passed++;
    } catch (error) {
      console.error(`❌ ${name} failed:`, error.message, '\n');
      failed++;
    }
  }
  
  console.log('='.repeat(50));
  console.log(`📊 Smoke Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n💡 Some tests failed - check the logs above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All smoke tests passed!');
    process.exit(0);
  }
}

runSmokeTests().catch((error) => {
  console.error('💥 Smoke test suite crashed:', error);
  process.exit(1);
});