#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Tests that all authentication routes are accessible and returns valid responses
 */

const https = require('https');

const BASE_URL = 'https://aybga5h1t24h.space.minimax.io';
const ROUTES = [
  '/',
  '/auth/signup',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback'
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
          headers: res.headers
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function validateRoute(route) {
  const url = `${BASE_URL}${route}`;
  console.log(`\nTesting: ${route}`);
  
  try {
    const response = await fetchPage(url);
    
    // Check status code
    if (response.statusCode !== 200) {
      console.log(`  ❌ FAIL: Status ${response.statusCode}`);
      return false;
    }
    console.log(`  ✅ Status: ${response.statusCode}`);
    
    // Check that it returns HTML
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('text/html')) {
      console.log(`  ❌ FAIL: Wrong content type: ${contentType}`);
      return false;
    }
    console.log(`  ✅ Content-Type: ${contentType}`);
    
    // Check for React root div
    if (!response.body.includes('<div id="root">')) {
      console.log(`  ❌ FAIL: Missing React root div`);
      return false;
    }
    console.log(`  ✅ React root div found`);
    
    // Check for JavaScript bundle
    if (!response.body.includes('/assets/index-') || !response.body.includes('.js')) {
      console.log(`  ❌ FAIL: JavaScript bundle not found`);
      return false;
    }
    console.log(`  ✅ JavaScript bundle referenced`);
    
    // Check for CSS
    if (!response.body.includes('/assets/index-') || !response.body.includes('.css')) {
      console.log(`  ❌ FAIL: CSS bundle not found`);
      return false;
    }
    console.log(`  ✅ CSS bundle referenced`);
    
    return true;
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function validateJavaScriptBundle() {
  console.log(`\n\nValidating JavaScript Bundle Content:`);
  
  try {
    // First get the index page to find the JS file name
    const indexResponse = await fetchPage(BASE_URL);
    const jsMatch = indexResponse.body.match(/\/assets\/(index-[^"]+\.js)/);
    
    if (!jsMatch) {
      console.log(`  ❌ Could not find JS bundle path`);
      return false;
    }
    
    const jsPath = jsMatch[1];
    console.log(`  Found bundle: ${jsPath}`);
    
    // Fetch the JavaScript bundle
    const jsUrl = `${BASE_URL}/assets/${jsPath}`;
    const jsResponse = await fetchPage(jsUrl);
    
    if (jsResponse.statusCode !== 200) {
      console.log(`  ❌ Failed to fetch JS bundle: ${jsResponse.statusCode}`);
      return false;
    }
    
    // Check for authentication-related code
    const checks = [
      { name: 'signUp function', pattern: /signUp/ },
      { name: 'signInWithEmail function', pattern: /signInWithEmail/ },
      { name: 'resetPassword function', pattern: /resetPassword/ },
      { name: 'auth/signup route', pattern: /auth\/signup/ },
      { name: 'auth/login route', pattern: /auth\/login/ },
      { name: 'auth/forgot-password route', pattern: /auth\/forgot-password/ },
    ];
    
    console.log(`\n  Checking for auth components in bundle:`);
    let allFound = true;
    
    for (const check of checks) {
      const found = check.pattern.test(jsResponse.body);
      console.log(`    ${found ? '✅' : '❌'} ${check.name}`);
      if (!found) allFound = false;
    }
    
    return allFound;
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Email/Password Authentication Deployment Validation');
  console.log('='.repeat(60));
  
  let allPassed = true;
  
  // Test all routes
  console.log('\n📍 TESTING ROUTES:');
  for (const route of ROUTES) {
    const passed = await validateRoute(route);
    if (!passed) allPassed = false;
  }
  
  // Validate bundle content
  const bundleValid = await validateJavaScriptBundle();
  if (!bundleValid) allPassed = false;
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED');
    console.log('\nDeployment is valid. All routes are accessible and the');
    console.log('JavaScript bundle contains the authentication code.');
    console.log('\nNext step: Manual browser testing recommended for:');
    console.log('  - UI/UX validation');
    console.log('  - Form validation behavior');
    console.log('  - Navigation flow');
    console.log('  - Visual consistency');
  } else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('\nPlease review the errors above.');
  }
  console.log('='.repeat(60));
  
  process.exit(allPassed ? 0 : 1);
}

main();
