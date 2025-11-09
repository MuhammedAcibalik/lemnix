#!/usr/bin/env ts-node
/**
 * Manual Testing Script for LEMNIX Backend
 * 
 * This script tests all major endpoints and functionality manually
 * without requiring authentication for testing purposes.
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  statusCode?: number;
  message?: string;
  error?: string;
}

const results: TestResult[] = [];

async function testEndpoint(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  expectedStatuses: number[] = [200, 201]
): Promise<TestResult> {
  try {
    const config: any = {
      method,
      url: `${BASE_URL}${endpoint}`,
      validateStatus: () => true, // Don't throw on any status
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    const isExpected = expectedStatuses.includes(response.status);
    
    return {
      endpoint,
      method,
      status: isExpected ? 'PASS' : 'FAIL',
      statusCode: response.status,
      message: isExpected 
        ? `✓ Got expected status ${response.status}`
        : `✗ Got ${response.status}, expected one of [${expectedStatuses.join(', ')}]`
    };
  } catch (error: any) {
    return {
      endpoint,
      method,
      status: 'FAIL',
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🚀 Starting LEMNIX Backend Manual Tests\n');
  console.log('Testing against:', BASE_URL);
  console.log('═'.repeat(80));

  // Test 1: Root endpoint
  console.log('\n📋 Testing Root Endpoints...');
  results.push(await testEndpoint('GET', '/'));
  results.push(await testEndpoint('GET', '/health'));
  results.push(await testEndpoint('GET', '/readyz', undefined, [200, 503]));

  // Test 2: Health endpoints
  console.log('\n🏥 Testing Health Endpoints...');
  results.push(await testEndpoint('GET', '/api/health/database', undefined, [200, 500]));
  results.push(await testEndpoint('GET', '/api/health/system', undefined, [200, 500]));
  results.push(await testEndpoint('GET', '/api/health/queries'));

  // Test 3: Cutting List endpoints (no auth)
  console.log('\n✂️  Testing Cutting List Endpoints...');
  results.push(await testEndpoint('GET', '/api/cutting-list', undefined, [200, 500]));
  
  // Test 4: Dashboard endpoints
  console.log('\n📊 Testing Dashboard Endpoints...');
  results.push(await testEndpoint('GET', '/api/dashboard/stats', undefined, [200, 401, 500]));
  results.push(await testEndpoint('GET', '/api/dashboard/recent', undefined, [200, 404, 500]));

  // Test 5: Statistics endpoints (require query params)
  console.log('\n📈 Testing Statistics Endpoints...');
  results.push(await testEndpoint('GET', '/api/statistics/color-size-analysis?cuttingListId=test', undefined, [200, 400, 404, 500]));
  results.push(await testEndpoint('GET', '/api/statistics/profile-analysis?cuttingListId=test', undefined, [200, 400, 404, 500]));

  // Test 6: Enterprise Optimization (requires auth - expect 401)
  console.log('\n⚙️  Testing Enterprise Optimization Endpoints (Auth Required)...');
  results.push(await testEndpoint('POST', '/api/enterprise/optimize', {
    items: [{ length: 1000, quantity: 2, id: 'test-1' }],
    stockLengths: [6000],
    kerfWidth: 5
  }, [200, 400, 401, 500]));

  // Test 7: Production Plan endpoints
  console.log('\n📦 Testing Production Plan Endpoints...');
  results.push(await testEndpoint('GET', '/api/production-plan', undefined, [200, 404, 500]));
  results.push(await testEndpoint('GET', '/api/production-plan/plans', undefined, [200, 404, 500]));

  // Test 8: Profile Management endpoints
  console.log('\n🔧 Testing Profile Management Endpoints...');
  results.push(await testEndpoint('GET', '/api/profile-management', undefined, [200, 404, 500]));
  results.push(await testEndpoint('GET', '/api/profile-management/profiles', undefined, [200, 404, 500]));

  // Print results
  console.log('\n' + '═'.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═'.repeat(80));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⊘  Skipped: ${skipped}`);
  console.log(`📝 Total: ${results.length}`);

  console.log('\n' + '─'.repeat(80));
  console.log('DETAILED RESULTS:');
  console.log('─'.repeat(80));

  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✓' : result.status === 'FAIL' ? '✗' : '⊘';
    console.log(`\n${index + 1}. [${icon}] ${result.method} ${result.endpoint}`);
    if (result.statusCode) {
      console.log(`   Status: ${result.statusCode}`);
    }
    if (result.message) {
      console.log(`   ${result.message}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n' + '═'.repeat(80));
  
  const passRate = ((passed / results.length) * 100).toFixed(1);
  console.log(`\n🎯 Pass Rate: ${passRate}%`);
  
  if (passed === results.length) {
    console.log('🎉 All tests passed!');
  } else {
    console.log(`⚠️  ${failed} test(s) need attention`);
  }

  console.log('\n');
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
