// Test script for streaming API endpoint
// This script tests the /api/analyze endpoint with a sample image

// Small 1x1 red pixel PNG as base64 (for testing purposes)
const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

const testRequest = {
  imageBase64: testImageBase64,
  userProfile: 'DIABETIC'
};

console.log('Testing streaming API endpoint...');
console.log('Request:', JSON.stringify(testRequest, null, 2));
console.log('\n--- Starting Stream ---\n');

fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testRequest),
})
  .then(async (response) => {
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('\n--- Stream Content ---\n');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('\n--- Stream Complete ---\n');
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      process.stdout.write(chunk); // Show streaming in real-time
      fullText += chunk;
    }

    // Try to parse the final JSON
    console.log('\n\n--- Parsing JSON ---\n');
    
    // Remove any markdown code blocks if present
    let jsonText = fullText.trim();
    jsonText = jsonText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    
    try {
      const parsed = JSON.parse(jsonText);
      console.log('✓ Successfully parsed JSON');
      console.log(JSON.stringify(parsed, null, 2));

      // Validate against schema
      console.log('\n--- Schema Validation ---\n');
      if (parsed && parsed.type) {
        console.log('✓ Response has "type" field:', parsed.type);
        
        switch (parsed.type) {
          case 'SAFE':
            console.log('✓ Type is SAFE');
            console.log('  - Has summary:', !!parsed.summary);
            console.log('  - Has safeBadge:', typeof parsed.safeBadge === 'boolean');
            if (parsed.summary && typeof parsed.safeBadge === 'boolean') {
              console.log('\n✅ SAFE response is valid!');
            }
            break;
          case 'RISK':
            console.log('✓ Type is RISK');
            console.log('  - Has headline:', !!parsed.headline);
            console.log('  - Has riskHierarchy:', Array.isArray(parsed.riskHierarchy));
            if (Array.isArray(parsed.riskHierarchy)) {
              console.log('  - Risk items count:', parsed.riskHierarchy.length);
              parsed.riskHierarchy.forEach((item, idx) => {
                console.log(`    ${idx + 1}. ${item.ingredient} (${item.severity}): ${item.reason}`);
              });
            }
            if (parsed.headline && Array.isArray(parsed.riskHierarchy)) {
              console.log('\n✅ RISK response is valid!');
            }
            break;
          case 'DECISION':
            console.log('✓ Type is DECISION');
            console.log('  - Has question:', !!parsed.question);
            console.log('  - Has options:', Array.isArray(parsed.options));
            if (Array.isArray(parsed.options)) {
              console.log('  - Options:', parsed.options.join(', '));
            }
            if (parsed.question && Array.isArray(parsed.options)) {
              console.log('\n✅ DECISION response is valid!');
            }
            break;
          case 'UNCERTAIN':
            console.log('✓ Type is UNCERTAIN');
            console.log('  - Has rawText:', !!parsed.rawText);
            if (parsed.rawText) {
              console.log('\n✅ UNCERTAIN response is valid!');
            }
            break;
          default:
            console.log('✗ Unknown type:', parsed.type);
        }
      } else {
        console.log('✗ Response missing "type" field');
      }
    } catch (e) {
      console.log('✗ Failed to parse JSON:', e.message);
      console.log('Raw text received:');
      console.log(fullText);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
