import { retrievalService, inventoryService, productService, returnService, ticketService } from '../services/mock';

async function testFullSuite() {
  console.log('--- Testing Comprehensive Query Matrix ---');
  const queries = [
    // 1. Availability / Stock
    'Is Amul milk available?',
    'do u have milk?',
    'is milk available?',
    'milk stock?',
    'how many milk packets?',
    'How many Maggi packets are available?',
    'Which Amul products are available?',
    'Which products are low in stock?',
    'Which products are out of stock?',
    
    // 2. Pricing
    'What is the price of Tata Tea?',
    'How much is Tata Tea?',
    'What is the price of Lay\'s Magic Masala?',
    
    // 3. Location / Wayfinding
    'Where is Maggi?',
    'maggi location?',
    'which aisle has maggi?',
    'Where is Tata Tea?',
    'Where is Aashirvaad Atta?',
    
    // 4. Categories & Multi-constraint
    'Show me dairy products.',
    'Show me snacks under ₹100.',
    'Show snacks under 100',
    'Show me products under ₹200',
    
    // 5. Comparisons & Recommendations
    'Compare Tata Tea and Red Label.',
    'Suggest breakfast ideas.',
    'Suggest snacks for a party.',
    'Give me a cheaper alternative.',
    'Which is the cheapest?',
    
    // 6. Return & Exchange Policy / Workflows
    'Can I return opened shampoo?',
    'My milk packet is spoiled',
    'My product is damaged',
    'What is the return policy?',
    'Check my return status',
    'Start a return',
    'Start an exchange',
    
    // 7. General Questions / Chit-Chat
    'Hi',
    'Hello',
    'How are you?',
    'What can you do?',
    'Who are you?',
    'What does FMCG mean?',
    'Explain dairy products.',
    'What is the difference between milk and curd?',
    'Thank you.',
    'Bye.'
  ];

  for (const q of queries) {
    const res = await retrievalService.retrieveContext(q);
    console.log(`\n========================================`);
    console.log(`Q: "${q}"`);
    console.log(`Intent: ${res.intent}`);
    console.log(`Matched Products: ${res.matchedProducts.map(p => p.name).join(', ')}`);
    console.log(`Response Preview: ${res.suggestedResponse.slice(0, 120)}...`);
  }

  // Multi-turn test:
  console.log(`\n========================================`);
  console.log(`=== Multi-Turn Memory Flow ===`);
  const mem: any = {};
  
  // Turn 1: Show me Amul products
  console.log(`\nTurn 1: "Show me Amul products."`);
  const t1 = await retrievalService.retrieveContext('Show me Amul products.', undefined, mem);
  mem.lastProduct = t1.matchedProducts[0];
  mem.lastProductId = t1.matchedProducts[0]?.id;
  mem.lastProducts = t1.matchedProducts;
  mem.lastBrand = 'Amul';
  console.log(`Intent: ${t1.intent}, Products: ${t1.matchedProducts.length}`);

  // Turn 2: Which one is cheapest?
  console.log(`\nTurn 2: "Which one is cheapest?"`);
  const t2 = await retrievalService.retrieveContext('Which one is cheapest?', undefined, mem);
  mem.lastProduct = t2.matchedProducts[0];
  mem.lastProductId = t2.matchedProducts[0]?.id;
  console.log(`Intent: ${t2.intent}, Answer: ${t2.suggestedResponse}`);

  // Turn 3: Where is that one?
  console.log(`\nTurn 3: "Where is that one?"`);
  const t3 = await retrievalService.retrieveContext('Where is that one?', undefined, mem);
  console.log(`Intent: ${t3.intent}, Answer: ${t3.suggestedResponse}`);

  // Turn 4: Can I return it?
  console.log(`\nTurn 4: "Can I return it?"`);
  const t4 = await retrievalService.retrieveContext('Can I return it?', undefined, mem);
  console.log(`Intent: ${t4.intent}, Answer: ${t4.suggestedResponse}`);
}

testFullSuite().catch(console.error);
