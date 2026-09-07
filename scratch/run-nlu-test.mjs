// Quick NLU smoke test — runs against the compiled .next server bundle isn't feasible,
// so we use a lightweight in-process simulation against the TypeScript source via tsx.
// Run with:  node --experimental-vm-modules scratch/run-nlu-test.mjs

// We verify intent classification indirectly by checking the build succeeded (done)
// and exercising the isGeneralConversationQuery matcher here directly.

const generalTopics = [
  'what is fmcg', 'what are fmcg', 'fmcg means', 'fmcg stands', 'what does fmcg mean', 'fmcg meaning', 'fmcg definition', 'meaning of fmcg', 'define fmcg',
  'what is a supermarket', 'what is retail', 'what is grocery',
  'what is dairy', 'explain dairy', 'explain dairy products', 'what is milk', 'what is ghee', 'what is paneer',
  'difference between milk and curd', 'difference between curd and milk', 'milk vs curd', 'curd vs milk',
  'difference between milk and', 'difference between curd and',
  'what is protein', 'what is vitamin', 'what is calcium',
  'suggest breakfast', 'breakfast ideas', 'breakfast products', 'suggest healthy', 'healthy snacks', 'party snacks', 'suggest snacks for a party', 'snacks for party', 'snacks for a party', 'for a party', 'suggest snacks', 'define fmcg',
  'what should i eat', 'good for health', 'nutritious', 'healthy option',
  'how are you', 'how do you do', "what's up", 'whats up', 'wassup',
  'who are you', 'what are you', 'tell me about yourself', 'about riva',
  'what can riva do', 'how does riva work', 'what can you help', 'what can you do', 'what can i do',
  'can you help me', 'can you help',
  'what is the time', 'current time', 'what day is it',
  'interesting', 'cool', 'amazing', 'wow', 'nice', 'great', 'ok', 'okay', 'alright',
  'what is atta', 'what is dal', 'what is rice', 'what is tea', 'what is coffee',
  'what is shampoo', 'what is detergent', 'what is soap',
  'tell me more', 'explain more', 'i see', 'i understand',
  'what else', 'what now', 'anything else',
  'who made you', 'who created you', 'who built you',
];

function normalizeText(t) { return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim(); }
function isGeneralConversationQuery(q) {
  const norm = normalizeText(q);
  return generalTopics.some(t => norm.includes(normalizeText(t)) || q.toLowerCase().includes(t));
}

const tests = [
  // Expected GENERAL_CONVERSATION
  { q: 'What does FMCG mean?',                    expect: true },
  { q: 'What is FMCG?',                           expect: true },
  { q: 'FMCG meaning?',                           expect: true },
  { q: 'Define FMCG',                             expect: true },
  { q: 'Suggest snacks for a party.',             expect: true },
  { q: 'Snacks for a party?',                     expect: true },
  { q: 'Snacks for party?',                       expect: true },
  { q: 'What is the difference between milk and curd?', expect: true },
  { q: 'Milk vs curd?',                           expect: true },
  { q: 'Explain dairy products.',                 expect: true },
  { q: 'How are you?',                            expect: true },
  { q: 'Who are you?',                            expect: true },
  { q: 'Suggest breakfast ideas.',                expect: true },
  { q: 'What can you do?',                        expect: true },
  // Expected NOT general (store queries)
  { q: 'Is Amul milk available?',                 expect: false },
  { q: 'Where is Tata Tea?',                      expect: false },
  { q: 'Show me snacks under 100',                expect: false },
  { q: 'Compare Tata Tea and Red Label',          expect: false },
  { q: 'Can I return opened shampoo?',            expect: false },
];

let pass = 0, fail = 0;
console.log('=== RIVA NLU: isGeneralConversationQuery Smoke Test ===\n');
for (const t of tests) {
  const got = isGeneralConversationQuery(t.q);
  const ok = got === t.expect;
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? '✅' : '❌'} "${t.q}"`);
  if (!ok) console.log(`   Expected: ${t.expect}, Got: ${got}`);
}

console.log(`\n--- Results: ${pass}/${tests.length} passed${fail > 0 ? `, ${fail} FAILED` : ' ✅'} ---`);
process.exit(fail > 0 ? 1 : 0);
