import { NextRequest, NextResponse } from 'next/server';
import { retrievalService } from '@/services/supabase';
import { MOCK_POLICIES } from '@/data/mockPolicies';
import { Product } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';

const RIVA_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search for FMCG retail products in the RIVA store inventory by name, brand, category, or price limit.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Product name or keyword (e.g., Amul, Tata Tea, Maggi, milk, biscuits)' },
          category: { type: 'string', description: 'Category: Dairy, Beverages, Snacks, Grocery & Staples, Personal Care, Household, Tea & Coffee, Biscuits & Cookies, Instant Food, Packaged Food, Bakery, Frozen Food, Fruits & Vegetables' },
          brand: { type: 'string', description: 'Brand name (Amul, Tata, Nestle, Britannia, Parle, etc.)' },
          maxPrice: { type: 'number', description: 'Maximum price in INR' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_location',
      description: 'Get the exact in-store aisle and shelf location for a product.',
      parameters: {
        type: 'object',
        properties: {
          productName: { type: 'string', description: 'Name or brand of product to locate' },
        },
        required: ['productName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_return_policy',
      description: 'Check return or exchange policy for a product category.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Product category or item name' },
          isOpened: { type: 'boolean', description: 'Whether the product was opened' },
          isDamaged: { type: 'boolean', description: 'Whether the item is damaged or spoiled' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_cart',
      description: 'Add a product to the customer cart.',
      parameters: {
        type: 'object',
        properties: {
          productName: { type: 'string', description: 'Name of product to add' },
          quantity: { type: 'number', description: 'Quantity (default 1)' },
        },
        required: ['productName'],
      },
    },
  },
];

async function executeRivaTool(name: string, args: any, memory: any) {
  if (name === 'search_products') {
    try {
      let products: any[] = [];
      if (isSupabaseConfigured()) {
        const { supabaseAdmin } = await import('@/lib/supabase');
        const q = (args.query || '').toLowerCase();
        const cat = args.category || '';
        const brand = (args.brand || '').toLowerCase();
        const maxP = args.maxPrice;
        let dbQuery = supabaseAdmin
          .from('products')
          .select('id, name, brand, category, price, mrp, unit, image_url, aisle, shelf, inventory(stock_quantity, availability)')
          .limit(8);
        if (q) dbQuery = dbQuery.or(`name.ilike.%${q}%,brand.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
        if (cat) dbQuery = dbQuery.ilike('category', `%${cat}%`);
        if (brand) dbQuery = dbQuery.ilike('brand', `%${brand}%`);
        if (maxP) dbQuery = dbQuery.lte('price', maxP);
        const { data, error } = await dbQuery;
        if (!error && data && data.length > 0) {
          products = data.map((row: any) => ({
            id: row.id, name: row.name, brand: row.brand, category: row.category,
            price: Number(row.price), mrp: row.mrp ? Number(row.mrp) : Number(row.price),
            stock: Number(row.inventory?.[0]?.stock_quantity ?? 0),
            aisle: row.aisle || 'Aisle 1', shelf: row.shelf || 'Shelf A1',
            image: row.image_url, unit: row.unit,
          }));
        }
      }
      if (products.length === 0) {
        const { MOCK_PRODUCTS } = await import('@/data/mockProducts');
        const { MOCK_INVENTORY } = await import('@/data/mockInventory');
        const q = (args.query || '').toLowerCase();
        const matches = MOCK_PRODUCTS.filter((p) => {
          const matchQ = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
          const matchCat = !args.category || p.category.toLowerCase().includes((args.category || '').toLowerCase());
          const matchBrand = !args.brand || p.brand.toLowerCase().includes((args.brand || '').toLowerCase());
          const matchP = !args.maxPrice || p.price <= args.maxPrice;
          return matchQ && matchCat && matchBrand && matchP;
        });
        products = matches.slice(0, 8).map((p) => {
          const inv = MOCK_INVENTORY.find((i) => i.productId === p.id);
          return { id: p.id, name: p.name, brand: p.brand, category: p.category, price: p.price, mrp: p.mrp || p.price, stock: inv ? inv.quantity : p.stockQuantity, aisle: p.location?.aisle || 'Aisle 1', shelf: p.location?.shelf || 'Shelf A1', image: p.image, unit: p.unit };
        });
      }
      return { source: 'RIVA Store Inventory', totalFound: products.length, products };
    } catch (e) {
      return { totalFound: 0, products: [] };
    }
  }

  if (name === 'get_product_location') {
    try {
      if (isSupabaseConfigured()) {
        const { supabaseAdmin } = await import('@/lib/supabase');
        const q = (args.productName || '').toLowerCase();
        const { data } = await supabaseAdmin.from('products').select('id, name, brand, aisle, shelf, category').or(`name.ilike.%${q}%,brand.ilike.%${q}%`).limit(1).single();
        if (data) return { found: true, productName: data.name, brand: data.brand, aisle: data.aisle || 'Aisle 1', shelf: data.shelf || 'Shelf A1', section: data.category };
      }
      const { MOCK_PRODUCTS } = await import('@/data/mockProducts');
      const q = (args.productName || '').toLowerCase();
      const p = MOCK_PRODUCTS.find((item) => item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q));
      if (p) return { found: true, productName: p.name, brand: p.brand, aisle: p.location?.aisle || p.aisle || 'Aisle 1', shelf: p.location?.shelf || p.shelf || 'Shelf A1' };
      return { found: false, message: `'${args.productName}' not found in store.` };
    } catch { return { found: false, message: 'Location lookup failed.' }; }
  }

  if (name === 'check_return_policy') {
    const cat = args.category || 'ALL';
    const policy = MOCK_POLICIES.find((pol) => pol.category.toLowerCase() === cat.toLowerCase()) || MOCK_POLICIES[0];
    const note = args.isDamaged ? 'Damaged items may qualify for immediate replacement — bring to Returns Counter.' : (args.isOpened && !policy.allowOpenedReturns) ? 'Opened products generally cannot be returned unless defective.' : '';
    return { category: policy.category, windowDays: policy.windowDays, requiresReceipt: policy.requiresReceipt, allowOpenedReturns: policy.allowOpenedReturns, autoApprovalLimit: policy.autoApprovalLimit, specialNote: note || undefined };
  }

  if (name === 'add_to_cart') {
    try {
      let productName = ''; let productId = ''; let price = 0;
      if (isSupabaseConfigured()) {
        const { supabaseAdmin } = await import('@/lib/supabase');
        const q = (args.productName || '').toLowerCase();
        const { data } = await supabaseAdmin.from('products').select('id, name, price').or(`name.ilike.%${q}%,brand.ilike.%${q}%`).limit(1).single();
        if (data) { productName = data.name; productId = data.id; price = data.price; }
      }
      if (!productId) {
        const { MOCK_PRODUCTS } = await import('@/data/mockProducts');
        const q = (args.productName || '').toLowerCase();
        const p = MOCK_PRODUCTS.find((item) => item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q));
        if (p) { productName = p.name; productId = p.id; price = p.price; }
      }
      if (productId) {
        const qty = args.quantity || 1;
        return { added: true, productId, product: { id: productId, name: productName, price }, quantity: qty, message: `Added ${qty}x ${productName} (₹${price}) to your cart.` };
      }
      return { added: false, message: `Could not find '${args.productName}'.` };
    } catch { return { added: false, message: 'Cart operation failed.' }; }
  }

  return { error: 'Unknown tool' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, memory, activeStoreId, language = 'en' } = body;
    if (!query || typeof query !== 'string') return NextResponse.json({ error: 'Query required' }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const ctx = await retrievalService.retrieveContext(query, activeStoreId, memory);
      return NextResponse.json({ success: true, provider: 'riva-engine-fallback', ...ctx });
    }

    const languageNames: Record<string, string> = { kn: 'Kannada (ಕನ್ನಡ)', hi: 'Hindi (हिन्दी)', ta: 'Tamil (தமிழ்)', te: 'Telugu (తెలుగు)', ml: 'Malayalam (മലയാളം)', mr: 'Marathi (मराठी)', bn: 'Bengali (বাংলা)', en: 'English', auto: 'the same language as the user query' };
    const targetLang = languageNames[language] || 'the language of the user query';

    const systemPrompt = `You are RIVA, the intelligent AI Retail Copilot for RIVA Store — a modern Indian FMCG grocery store in Bangalore.

Store: RIVA Store Bangalore | Inventory synced from RIVA database
Products: 100+ Indian FMCG brands — Amul, Tata, Britannia, Parle, Nestlé, Maggi, Surf Excel, Dove, Dettol, Colgate, Pepsi, Lay's, Kurkure, Haldiram's, Fortune, India Gate, Bru, Nescafé, Mother Dairy, MTR and more.

Tone: Warm, natural, conversational — like a friendly store assistant. Understand spelling mistakes, follow-up questions, and pronouns like "that one", "it", "the first one".
Language: Respond fluently in ${targetLang}.
Rules: NEVER say "according to our database". ALWAYS use tools for product/stock/location queries. Convert tool results to natural sentences.`;

    const msgs: any[] = [{ role: 'system', content: systemPrompt }, { role: 'user', content: query }];

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: msgs, tools: RIVA_TOOLS, tool_choice: 'auto', temperature: 0.4, max_tokens: 500 }),
    });

    if (resp.ok) {
      const data = await resp.json();
      const message = data.choices?.[0]?.message;
      let matchedProducts: Product[] = [];

      if (message?.tool_calls?.length > 0) {
        msgs.push(message);
        for (const toolCall of message.tool_calls) {
          const fnName = toolCall.function.name;
          const fnArgs = JSON.parse(toolCall.function.arguments || '{}');
          const toolResult = await executeRivaTool(fnName, fnArgs, memory);
          if (fnName === 'search_products' && toolResult.products) matchedProducts = toolResult.products as any[];
          msgs.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(toolResult) });
        }
        const resp2 = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages: msgs, temperature: 0.4, max_tokens: 450 }),
        });
        if (resp2.ok) {
          const d2 = await resp2.json();
          const finalAnswer = d2.choices?.[0]?.message?.content || 'I retrieved the product data for you.';
          return NextResponse.json({ success: true, provider: 'openai-tool-calls', suggestedResponse: finalAnswer, matchedProducts: matchedProducts.length > 0 ? matchedProducts : (await retrievalService.retrieveContext(query, activeStoreId, memory)).matchedProducts, suggestedFollowUps: ['Add to cart', 'Where is it?', 'Show cheaper options', 'Can I return this?'] });
        }
      }

      const directAnswer = message?.content || (await retrievalService.retrieveContext(query, activeStoreId, memory)).suggestedResponse;
      return NextResponse.json({ success: true, provider: 'openai-direct', suggestedResponse: directAnswer, matchedProducts: (await retrievalService.retrieveContext(query, activeStoreId, memory)).matchedProducts, suggestedFollowUps: ['Show dairy products', 'Find snacks under ₹100', 'Where is Amul milk?'] });
    }

    const fallback = await retrievalService.retrieveContext(query, activeStoreId, memory);
    return NextResponse.json({ success: true, provider: 'riva-engine-fallback', ...fallback });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    const fallback = await retrievalService.retrieveContext('help', undefined, {});
    return NextResponse.json({ success: true, provider: 'riva-engine-fallback', ...fallback });
  }
}
