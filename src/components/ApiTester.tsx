import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TestResult {
  name: string;
  success: boolean;
  status?: number;
  response?: any;
  error?: string;
  timestamp: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  successRate: number;
}

const ApiTester: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<TestSummary>({ total: 0, passed: 0, failed: 0, successRate: 0 });
  const [baseUrl, setBaseUrl] = useState('http://localhost:5000/api');
  const [timeout, setTimeout] = useState(10000);

  // Helper function to make API requests
  const testEndpoint = async (method: string, endpoint: string, data?: any, description?: string): Promise<TestResult> => {
    const testName = description || `${method} ${endpoint}`;
    const timestamp = new Date().toLocaleTimeString();

    try {
      const config: RequestInit = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(timeout),
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${baseUrl}${endpoint}`, config);
      const responseData = await response.text();
      
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        parsedData = responseData;
      }

      return {
        name: testName,
        success: response.ok,
        status: response.status,
        response: parsedData,
        timestamp,
      };
    } catch (error: any) {
      return {
        name: testName,
        success: false,
        error: error.message || 'Network Error',
        timestamp,
      };
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    // Test API Overview
    results.push(await testEndpoint('GET', '', null, 'API Overview'));

    // Test Authentication
    results.push(await testEndpoint('POST', '/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123!',
      company: 'Test Corp',
      role: 'operator'
    }, 'User Registration'));

    results.push(await testEndpoint('POST', '/auth/login', {
      email: 'test@example.com',
      password: 'TestPassword123!'
    }, 'User Login'));

    // Test Slots
    results.push(await testEndpoint('GET', '/slots', null, 'Get All Slots'));
    results.push(await testEndpoint('GET', '/slots/1', null, 'Get Slot by ID'));

    // Test Sponsors
    results.push(await testEndpoint('GET', '/sponsors', null, 'Get All Sponsors'));
    results.push(await testEndpoint('GET', '/sponsors/1', null, 'Get Sponsor by ID'));

    // Test Blocks
    results.push(await testEndpoint('GET', '/blocks', null, 'Get All Blocks'));
    results.push(await testEndpoint('GET', '/blocks/active', null, 'Get Active Block'));

    // Test Analytics
    results.push(await testEndpoint('GET', '/analytics/overview', null, 'Get Analytics Overview'));

    // Test AR
    results.push(await testEndpoint('GET', '/ar/models', null, 'Get AR Models'));
    results.push(await testEndpoint('GET', '/ar/triggers', null, 'Get AR Triggers'));

    // Test Bidding
    results.push(await testEndpoint('GET', '/bidding/active', null, 'Get Active Bids'));

    // Test Sync
    results.push(await testEndpoint('GET', '/sync/status', null, 'Get Sync Status'));

    // Test Devices
    results.push(await testEndpoint('GET', '/devices', null, 'Get All Devices'));

    // Test Beamer
    results.push(await testEndpoint('GET', '/beamer/status', null, 'Get Beamer Status'));

    // Test iPad
    results.push(await testEndpoint('GET', '/ipad/status', null, 'Get iPad Status'));

    setTestResults(results);
    setIsRunning(false);
  };

  // Calculate summary when results change
  useEffect(() => {
    if (testResults.length > 0) {
      const total = testResults.length;
      const passed = testResults.filter(r => r.success).length;
      const failed = total - passed;
      const successRate = total > 0 ? (passed / total) * 100 : 0;

      setSummary({ total, passed, failed, successRate });
    }
  }, [testResults]);

  // Test individual endpoint
  const testSingleEndpoint = async () => {
    const method = (document.getElementById('test-method') as HTMLSelectElement).value;
    const endpoint = (document.getElementById('test-endpoint') as HTMLInputElement).value;
    const dataInput = (document.getElementById('test-data') as HTMLTextAreaElement).value;
    
    let data;
    if (dataInput.trim()) {
      try {
        data = JSON.parse(dataInput);
      } catch {
        alert('Invalid JSON data');
        return;
      }
    }

    const result = await testEndpoint(method, endpoint, data, `Custom: ${method} ${endpoint}`);
    setTestResults(prev => [result, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🧪 BeamerShow API Tester</h1>
          <p className="text-xl text-gray-600">Test all endpoints from the frontend</p>
        </motion.div>

        {/* Configuration */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-semibold mb-4">⚙️ Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="http://localhost:5000/api"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={timeout}
                onChange={(e) => setTimeout(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1000"
                max="60000"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Custom Test */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-semibold mb-4">🎯 Custom Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
              <select
                id="test-method"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint</label>
              <input
                id="test-endpoint"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/slots"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data (JSON)</label>
              <textarea
                id="test-data"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='{"key": "value"}'
                rows={1}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={testSingleEndpoint}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Test Endpoint
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        {summary.total > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-2xl font-semibold mb-4">📊 Test Results Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">{summary.total}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{summary.passed}</div>
                <div className="text-sm text-green-600">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{summary.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="text-center p-4 bg-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{summary.successRate.toFixed(1)}%</div>
                <div className="text-sm text-blue-600">Success Rate</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4">🔍 Test Results</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.success 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{result.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? '✅ PASSED' : '❌ FAILED'}
                      </span>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                  </div>
                  
                  {result.success ? (
                    <div className="text-sm text-gray-600">
                      <div>Status: <span className="font-medium">{result.status}</span></div>
                      {result.response && (
                        <div className="mt-2">
                          <div className="font-medium mb-1">Response:</div>
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.response, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      Error: {result.error}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ApiTester;
