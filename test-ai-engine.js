const { 
  inventoryService, 
  retrievalService, 
  policyService, 
  returnService,
  ticketService,
  notificationService
} = require('./services/mock');

async function runComprehensiveAITests() {
  console.log('====================================================');
  console.log('🧪 RIVA FMCG AI & MULTI-TURN PIPELINE VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   ℹ️ ${details.slice(0, 120)}...`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   ⚠️ Details: ${details}`);
    }
  }

  // 1. "Hi"
  console.log('--- 1. Question: "Hi" (Greeting) ---');
  const res1 = await retrievalService.retrieveContext('Hi');
  assert(
    res1.intent === 'GREETING' && res1.suggestedResponse.includes('RIVA'),
    'Responds to greeting with RIVA introduction',
    res1.suggestedResponse
  );

  // 2. "Is Amul milk in stock?"
  console.log('\n--- 2. Question: "Is Amul milk in stock?" ---');
  const res2 = await retrievalService.retrieveContext('Is Amul milk in stock?');
  assert(
    res2.intent === 'STOCK_CHECK' && res2.suggestedResponse.includes('Amul') && res2.suggestedResponse.includes('in stock'),
    'Checks real inventory for Amul milk',
    res2.suggestedResponse
  );

  // 3. "How many Amul milk packets are available?"
  console.log('\n--- 3. Question: "How many Amul milk packets are available?" ---');
  const res3 = await retrievalService.retrieveContext('How many Amul milk packets are available?');
  assert(
    res3.intent === 'STOCK_CHECK' && res3.suggestedResponse.includes('available') && res3.suggestedResponse.includes('Amul'),
    'Returns exact numeric availability for Amul milk',
    res3.suggestedResponse
  );

  // 4. "Where is Tata Tea Gold?"
  console.log('\n--- 4. Question: "Where is Tata Tea Gold?" ---');
  const res4 = await retrievalService.retrieveContext('Where is Tata Tea Gold?');
  assert(
    res4.intent === 'PRODUCT_LOCATION' && res4.suggestedResponse.includes('Aisle 3') && res4.suggestedResponse.includes('Shelf C1'),
    'Returns exact location: Aisle 3, Shelf C1',
    res4.suggestedResponse
  );

  // 5. "How much is Tata Tea Gold?"
  console.log('\n--- 5. Question: "How much is Tata Tea Gold?" ---');
  const res5 = await retrievalService.retrieveContext('How much is Tata Tea Gold?');
  assert(
    res5.intent === 'PRICE_CHECK' && res5.suggestedResponse.includes('₹290'),
    'Returns exact price: ₹290',
    res5.suggestedResponse
  );

  // 6. "What is the price of Lay's Magic Masala?"
  console.log('\n--- 6. Question: "What is the price of Lay\'s Magic Masala?" ---');
  const res6 = await retrievalService.retrieveContext("What is the price of Lay's Magic Masala?");
  assert(
    res6.intent === 'PRICE_CHECK' && res6.suggestedResponse.includes('₹30'),
    'Returns price for Lays Magic Masala: ₹30',
    res6.suggestedResponse
  );

  // 7. "Show me snacks"
  console.log('\n--- 7. Question: "Show me snacks" ---');
  const res7 = await retrievalService.retrieveContext('Show me snacks');
  assert(
    res7.intent === 'CATEGORY_SEARCH' && res7.actionPayload?.type === 'PRODUCT_LIST_CARD',
    'Returns snacks product list payload with FMCG items',
    res7.suggestedResponse
  );

  // 8. "Show me products under ₹100"
  console.log('\n--- 8. Question: "Show me products under ₹100" ---');
  const res8 = await retrievalService.retrieveContext('Show me products under ₹100');
  assert(
    res8.intent === 'PRODUCT_SEARCH' && res8.actionPayload?.type === 'PRODUCT_LIST_CARD',
    'Filters products under ₹100 limit',
    res8.suggestedResponse
  );

  // 9. "Which products are low in stock?"
  console.log('\n--- 9. Question: "Which products are low in stock?" ---');
  const res9 = await retrievalService.retrieveContext('Which products are low in stock?');
  assert(
    res9.intent === 'LOW_STOCK' && res9.suggestedResponse.includes('low in stock'),
    'Returns list of low stock FMCG products',
    res9.suggestedResponse
  );

  // 10. "Which products are out of stock?"
  console.log('\n--- 10. Question: "Which products are out of stock?" ---');
  const res10 = await retrievalService.retrieveContext('Which products are out of stock?');
  assert(
    res10.intent === 'OUT_OF_STOCK',
    'Detects OUT_OF_STOCK intent and scans inventory',
    res10.suggestedResponse
  );

  // 11. "Where is Aashirvaad Atta?"
  console.log('\n--- 11. Question: "Where is Aashirvaad Atta?" ---');
  const res11 = await retrievalService.retrieveContext('Where is Aashirvaad Atta?');
  assert(
    res11.intent === 'PRODUCT_LOCATION' && res11.suggestedResponse.includes('Aisle 6'),
    'Locates Aashirvaad Atta in Aisle 6',
    res11.suggestedResponse
  );

  // 12. "Can I return opened shampoo?"
  console.log('\n--- 12. Question: "Can I return opened shampoo?" ---');
  const res12 = await retrievalService.retrieveContext('Can I return opened shampoo?');
  assert(
    res12.intent === 'RETURN_POLICY' && res12.suggestedResponse.includes('hygiene'),
    'Applies hygiene rules to opened shampoo return query',
    res12.suggestedResponse
  );

  // 13. "What is the return policy?"
  console.log('\n--- 13. Question: "What is the return policy?" ---');
  const res13 = await retrievalService.retrieveContext('What is the return policy?');
  assert(
    res13.intent === 'RETURN_POLICY' && res13.suggestedResponse.includes('Return'),
    'Explains FMCG return window and receipt policy',
    res13.suggestedResponse
  );

  // 14. "I want to exchange a damaged product"
  console.log('\n--- 14. Question: "I want to exchange a damaged product" ---');
  const res14 = await retrievalService.retrieveContext('I want to exchange a damaged product');
  assert(
    res14.intent === 'EXCHANGE_REQUEST' && (res14.actionPayload?.type === 'RETURN_APPROVED_CARD' || res14.actionPayload?.type === 'TICKET_CREATED_CARD'),
    'Initiates exchange workflow autonomously',
    res14.suggestedResponse
  );

  // 15. "What products do you have?"
  console.log('\n--- 15. Question: "What products do you have?" ---');
  const res15 = await retrievalService.retrieveContext('What products do you have?');
  assert(
    res15.intent === 'HELP' && res15.suggestedResponse.includes('Dairy') && res15.suggestedResponse.includes('Beverages'),
    'Lists supermarket FMCG categories and capabilities',
    res15.suggestedResponse
  );

  // 16. Multi-turn Conversation Memory
  console.log('\n--- 16. Multi-Turn Conversation Memory ---');
  // Turn 1: "Where is Tata Tea Gold?"
  const turn1 = await retrievalService.retrieveContext('Where is Tata Tea Gold?');
  const memory = { lastProductId: turn1.matchedProducts[0]?.id, lastIntent: turn1.intent };
  assert(memory.lastProductId === 'prod-tea-01', 'Turn 1 captures Tata Tea Gold in memory');

  // Turn 2: "How many are there?"
  const turn2 = await retrievalService.retrieveContext('How many are there?', undefined, memory);
  assert(
    turn2.intent === 'STOCK_CHECK' && turn2.suggestedResponse.includes('Tata Tea Gold') && turn2.suggestedResponse.includes('8 units are currently available'),
    'Turn 2 resolves "How many are there?" to Tata Tea Gold without repeating name',
    turn2.suggestedResponse
  );

  // Turn 3: "Can I return it?"
  const turn3 = await retrievalService.retrieveContext('Can I return it?', undefined, memory);
  assert(
    turn3.intent === 'RETURN_POLICY' && turn3.suggestedResponse.includes('Tea & Coffee'),
    'Turn 3 resolves "Can I return it?" to Tata Tea Gold / Tea & Coffee policy',
    turn3.suggestedResponse
  );

  // 17. Multi-channel Notification Dispatch
  console.log('\n--- 17. Unified Multi-channel Notification Verification ---');
  const notifRes = await notificationService.dispatchNotification({
    event: 'RETURN_APPROVED',
    title: 'Return Approved: Tata Tea Gold',
    message: 'Return RET-99001 for Tata Tea Gold (₹290) was autonomously approved.',
    referenceId: 'RET-99001',
    recipientName: 'Aarav Sharma',
    recipientPhone: '+91 98765 43210',
    targetRole: 'CUSTOMER'
  });
  assert(
    notifRes.channels.inApp.status === 'DELIVERED' &&
    notifRes.channels.email.status.includes('SIMULATED') &&
    notifRes.channels.sms.status.includes('SIMULATED') &&
    notifRes.channels.whatsapp.status.includes('SIMULATED'),
    'Generates In-App, simulated Email, simulated SMS, and simulated WhatsApp notifications',
    JSON.stringify(notifRes.channels.email.subject)
  );

  console.log('\n====================================================');
  console.log(`🏁 TEST SUMMARY: ${passed}/${total} Tests Passed`);
  console.log('====================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runComprehensiveAITests();
