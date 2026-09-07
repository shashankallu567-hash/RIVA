const { 
  inventoryService, 
  retrievalService, 
  policyService, 
  returnService 
} = require('./services/mock');

async function runInventoryTests() {
  console.log('====================================================');
  console.log('🧪 RIVA LIVE INVENTORY ENGINE VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   ℹ️ ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   ⚠️ Details: ${details}`);
    }
  }

  // 1. Initial State Check
  console.log('--- 1. Testing Initial Catalog & Stock ---');
  const allInv = await inventoryService.getAllInventory();
  assert(allInv.length >= 15, 'Inventory contains at least 15 realistic retail items', `Count: ${allInv.length} products`);

  const tataTeaStock = await inventoryService.checkStock('Tata Tea Gold');
  assert(tataTeaStock.quantity === 8, 'Tata Tea Gold initial stock is 8 units', `Quantity: ${tataTeaStock.quantity}`);

  // 2. Flow A: "Where is Tata Tea Gold?"
  console.log('\n--- 2. Flow A: Location Query ---');
  const locQueryRes = await retrievalService.retrieveContext('Where is Tata Tea Gold?');
  console.log(`Assistant Response: "${locQueryRes.suggestedResponse}"`);
  assert(
    locQueryRes.suggestedResponse.includes('Aisle 3') && locQueryRes.suggestedResponse.includes('Shelf C1'),
    'Assistant correctly returns location: Aisle 3, Shelf C1',
    locQueryRes.suggestedResponse
  );

  // 3. Flow B: "Is Tata Tea Gold in stock?"
  console.log('\n--- 3. Flow B: Stock Query (Initial 8 units) ---');
  const stockQueryRes = await retrievalService.retrieveContext('Is Tata Tea Gold in stock?');
  console.log(`Assistant Response: "${stockQueryRes.suggestedResponse}"`);
  assert(
    stockQueryRes.suggestedResponse.includes('in stock') && stockQueryRes.suggestedResponse.includes('8 units are currently available'),
    'Assistant correctly returns: 8 units are currently available',
    stockQueryRes.suggestedResponse
  );

  // 4. Flow C: Change stock to 0
  console.log('\n--- 4. Flow C: Update Stock to 0 (Out of Stock) ---');
  const tataProduct = await inventoryService.getProductByName('Tata Tea Gold');
  await inventoryService.updateStock(tataProduct.product.id, 0, 'Manual update');
  
  const zeroStockQueryRes = await retrievalService.retrieveContext('Is Tata Tea Gold in stock?');
  console.log(`Assistant Response: "${zeroStockQueryRes.suggestedResponse}"`);
  assert(
    zeroStockQueryRes.suggestedResponse.includes('currently out of stock'),
    'Assistant immediately responds OUT OF STOCK when stock is 0',
    zeroStockQueryRes.suggestedResponse
  );

  // 5. Flow D: Increase stock to 10
  console.log('\n--- 5. Flow D: Update Stock from 0 to 10 ---');
  await inventoryService.updateStock(tataProduct.product.id, 10, 'Restock');
  const tenStockQueryRes = await retrievalService.retrieveContext('Is Tata Tea Gold in stock?');
  console.log(`Assistant Response: "${tenStockQueryRes.suggestedResponse}"`);
  assert(
    tenStockQueryRes.suggestedResponse.includes('10 units are currently available'),
    'Assistant immediately responds 10 units are currently available',
    tenStockQueryRes.suggestedResponse
  );

  // 6. Activity Log Verification
  console.log('\n--- 6. Activity Log Verification ---');
  const logs = await inventoryService.getInventoryActivityLogs();
  assert(logs.length >= 2, 'Inventory activity logs generated for mutations', `Total logs: ${logs.length}`);
  console.log(`Recent Log: ${logs[0].productName} (${logs[0].previousQuantity} -> ${logs[0].newQuantity}) Reason: ${logs[0].reason}`);

  // 7. Flow E: Return / Exchange Workflow Preservation
  console.log('\n--- 7. Flow E: Return / Exchange Workflow Preservation ---');
  const returnEval = await policyService.evaluateEligibility({
    productId: 'prod-dairy-01',
    productCategory: 'Dairy',
    purchaseDate: new Date().toISOString(),
    price: 32,
    isOpened: false,
    hasReceipt: true,
    reason: 'Defective carton'
  });
  assert(returnEval.eligibility === 'ELIGIBLE_AUTO', 'Compliant return evaluates as ELIGIBLE_AUTO');

  console.log('\n====================================================');
  console.log(`🏁 TEST SUMMARY: ${passed}/${total} Tests Passed`);
  console.log('====================================================\n');
}

runInventoryTests();
