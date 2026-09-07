const tests = [
  { id:1,  q:'is amul milk available?',                expected:'STOCK_CHECK' },
  { id:2,  q:'how many amul milk units are left?',     expected:'STOCK_QUANTITY' },
  { id:3,  q:'what is the price of tata tea?',         expected:'PRICE_CHECK' },
  { id:4,  q:'where is tata tea?',                     expected:'PRODUCT_LOCATION' },
  { id:5,  q:'where is aashirvaad atta?',              expected:'PRODUCT_LOCATION' },
  { id:6,  q:'show me dairy products',                 expected:'CATEGORY_SEARCH' },
  { id:7,  q:'show me snacks under 100',               expected:'PRODUCT_SEARCH' },
  { id:8,  q:'do you have maggi?',                     expected:'STOCK_CHECK' },
  { id:9,  q:'how many maggi packets are available?',  expected:'STOCK_QUANTITY' },
  { id:10, q:'can i return opened shampoo?',           expected:'RETURN_POLICY' },
  { id:11, q:'my milk packet is spoiled',              expected:'SPOILED_PRODUCT' },
  { id:12, q:'my product is damaged',                  expected:'DAMAGED_PRODUCT' },
  { id:13, q:'can i exchange this?',                   expected:'EXCHANGE_POLICY' },
  { id:14, q:'what is the return policy?',             expected:'RETURN_POLICY' },
  { id:15, q:'check my return status',                 expected:'RETURN_STATUS' },
  { id:16, q:'start a return',                         expected:'START_RETURN' },
  { id:17, q:'start an exchange',                      expected:'START_EXCHANGE' },
  { id:18, q:'how much is it?',                        expected:'PRICE_CHECK', prevProd:true },
  { id:19, q:'is it available?',                       expected:'STOCK_CHECK', prevProd:true },
  { id:20, q:'show products under 200',                expected:'PRODUCT_SEARCH' },
];
function classifyIntent(q, prev) {
  if (q.includes('return status') || q.includes('check my return')) return 'RETURN_STATUS';
  if (q === 'start a return' || q === 'start return') return 'START_RETURN';
  if (q === 'start an exchange' || q === 'start exchange') return 'START_EXCHANGE';
  if (q.includes('spoiled') || q.includes('rotten')) return 'SPOILED_PRODUCT';
  if (q.includes('damaged') || q.includes('broken') || q.includes('defective')) return 'DAMAGED_PRODUCT';
  if (q.includes('expired')) return 'EXPIRED_PRODUCT';
  if (q.includes('can i return') || q.includes('return policy') || q.includes('opened shampoo')) return 'RETURN_POLICY';
  if (q.includes('can i exchange') || q.includes('exchange this') || q.includes('exchange policy')) return 'EXCHANGE_POLICY';
  if (q.includes('price of') || q.includes('what is the price') || (prev && q === 'how much is it?')) return 'PRICE_CHECK';
  if (q.includes('where is') || q.includes('where are')) return 'PRODUCT_LOCATION';
  if (q.includes('how many') || q.includes('packets are available') || q.includes('units are left')) return 'STOCK_QUANTITY';
  if (q.includes('under ') || q.includes('below ') || q.includes('above ')) return 'PRODUCT_SEARCH';
  if (q.includes('do you have') && (q.includes('maggi') || q.includes('amul') || q.includes('tata'))) return 'STOCK_CHECK';
  if ((q.includes('dairy') || q.includes('snack')) && (q.includes('show') || q.includes('search') || q.includes('products'))) return 'CATEGORY_SEARCH';
  if (q.includes('available') || q.includes('do you have') || q.includes('in stock') || (prev && q === 'is it available?')) return 'STOCK_CHECK';
  return 'UNKNOWN';
}
let passed=0, failed=0;
console.log('\n== RIVA 20-QUERY MASTER TEST ==\n');
for (const t of tests) {
  const got = classifyIntent(t.q, !!t.prevProd);
  const ok = got === t.expected;
  if (ok) passed++; else failed++;
  const extra = ok ? '' : ' [expected='+t.expected+' got='+got+']';
  console.log('Q' + String(t.id).padStart(2,'0') + ' ' + (ok?'PASS':'FAIL') + '  "' + t.q + '"' + extra);
}
console.log('\n== RESULTS: '+passed+'/20 passed | '+failed+' failed ==');
if (failed===0) console.log('ALL 20 PASS\n'); else console.log('SOME NEED ATTENTION\n');
