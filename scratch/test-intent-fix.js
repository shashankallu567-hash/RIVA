const { retrievalService } = require('../services/mock');

async function testIntentFixes() {
  console.log('Testing Chatbot Intent Fixes...');
  
  const testQueries = [
    "can u search dairy products",
    "show dairy",
    "dairy products",
    "what dairy items do you have",
    "show me dairy items",
    "products under 100",
    "biscuits under ₹50",
    "atta above 200",
    "Amul products",
    "what do you have from Tata",
    "show Britannia items",
    "where is Fortune oil and how much stock"
  ];

  for (const q of testQueries) {
    const res = await retrievalService.retrieveContext(q);
    console.log(`\n========================================`);
    console.log(`QUERY: "${q}"`);
    console.log(`INTENT: ${res.intent}`);
    console.log(`CATEGORY: ${res.entities?.category || 'N/A'}`);
    console.log(`BRAND: ${res.entities?.brandName || 'N/A'}`);
    console.log(`PRICE LIMIT: ${res.entities?.priceLimit || 'N/A'}`);
    console.log(`RESPONSE:\n${res.suggestedResponse.slice(0, 300)}...`);
  }
}

testIntentFixes();
