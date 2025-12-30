/**
 * Simple test script to verify the streaming API endpoint
 * Run with: node test-streaming-api.js
 */

const http = require('http');

// Sample base64 image (1x1 transparent PNG)
const sampleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const testData = JSON.stringify({
  imageBase64: sampleImage,
  userProfile: 'VEGAN'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('🧪 Testing streaming API endpoint...\n');
console.log('Request:', {
  url: `http://${options.hostname}:${options.port}${options.path}`,
  method: options.method,
  profile: 'VEGAN'
});
console.log('\n📡 Streaming response:\n');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  console.log('\n--- Stream Data ---\n');

  let chunkCount = 0;
  let fullData = '';

  res.on('data', (chunk) => {
    chunkCount++;
    const chunkStr = chunk.toString();
    fullData += chunkStr;
    console.log(`Chunk ${chunkCount}:`, chunkStr.substring(0, 100) + (chunkStr.length > 100 ? '...' : ''));
  });

  res.on('end', () => {
    console.log('\n--- Stream Complete ---\n');
    console.log(`Total chunks received: ${chunkCount}`);
    console.log(`Total data length: ${fullData.length} bytes`);
    
    // Try to parse as JSON if it looks like JSON
    if (fullData.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(fullData);
        console.log('\n✅ Parsed JSON response:');
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('\n⚠️  Could not parse as JSON (might be streaming format)');
        console.log('Raw data:', fullData.substring(0, 500));
      }
    } else {
      console.log('\n📝 Raw response (first 500 chars):');
      console.log(fullData.substring(0, 500));
    }
    
    console.log('\n✅ Test complete!');
  });
});

req.on('error', (e) => {
  console.error(`\n❌ Request error: ${e.message}`);
  console.error('Make sure the dev server is running on http://localhost:3000');
});

req.write(testData);
req.end();
