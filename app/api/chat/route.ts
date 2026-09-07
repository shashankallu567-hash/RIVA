import { NextRequest, NextResponse } from 'next/server';
import { retrievalService } from '@/services/mock';
import { MOCK_PRODUCTS } from '@/data/mockProducts';
import { MOCK_INVENTORY } from '@/data/mockInventory';
import { MOCK_POLICIES } from '@/data/mockPolicies';
import { Product } from '@/types';

// Define OpenAI Tools for Server-Side Execution
const RIVA_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search for FMCG retail products in store inventory by name, brand, category, or price limit.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Product name or search keyword (e.g., Amul, Tata Tea, Maggi, milk, biscuits)' },
          category: { type: 'string', description: 'Product category (Dairy, Beverages, Snacks, Grocery & Staples, Personal Care, Household)' },
          brand: { type: 'string', description: 'Brand name (Amul, Tata, Nestle, Britannia, Parle, etc.)' },
          maxPrice: { type: 'number', description: 'Maximum price limit in INR ₹' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_location',
      description: 'Get exact in-store location (aisle, section, shelf) for a product.',
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
      description: 'Check return or exchange policy guidelines for a product category or condition.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Product category or item name' },
          isOpened: { type: 'boolean', description: 'Whether the product packet was opened' },
          isDamaged: { type: 'boolean', description: 'Whether the item is damaged or spoiled' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_cart',
      description: 'Add a product to customer cart.',
      parameters: {
        type: 'object',
        properties: {
          productName: { type: 'string', description: 'Name of product to add' },
          quantity: { type: 'number', description: 'Quantity to add (default 1)' },
        },
        required: ['productName'],
      },
    },
  },
];

// Execute server-side tool functions
async function executeRivaTool(name: string, args: any, memory: any) {
  if (name === 'search_products') {
    const q = (args.query || '').toLowerCase();
    const cat = (args.category || '').toLowerCase();
    const brand = (args.brand || '').toLowerCase();
    const maxP = args.maxPrice;

    const matches = MOCK_PRODUCTS.filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchCat = !cat || p.category.toLowerCase().includes(cat);
      const matchBrand = !brand || p.brand.toLowerCase().includes(brand);
      const matchP = !maxP || p.price <= maxP;
      return matchQ && matchCat && matchBrand && matchP;
    });

    const enriched = matches.map((p) => {
      const inv = MOCK_INVENTORY.find((i) => i.productId === p.id);
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        mrp: p.mrp || p.price,
        stock: inv ? inv.quantity : p.stockQuantity,
        aisle: p.location?.aisle || '1',
        shelf: p.location?.shelf || 'A1',
      };
    });

    return { totalFound: enriched.length, products: enriched.slice(0, 6) };
  }

  if (name === 'get_product_location') {
    const q = (args.productName || '').toLowerCase();
    const p = MOCK_PRODUCTS.find((item) => item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q));
    if (p) {
      return {
        found: true,
        productName: p.name,
        brand: p.brand,
        aisle: p.location?.aisle || p.aisle || 'Aisle 1',
        section: p.location?.section || 'Section A',
        shelf: p.location?.shelf || p.shelf || 'Shelf A1',
      };
    }
    return { found: false, message: `Product '${args.productName}' not found in store directory.` };
  }

  if (name === 'check_return_policy') {
    const cat = args.category || 'ALL';
    const policy = MOCK_POLICIES.find((pol) => pol.category.toLowerCase() === cat.toLowerCase()) || MOCK_POLICIES[0];
    return {
      category: policy.category,
      windowDays: policy.windowDays,
      requiresReceipt: policy.requiresReceipt,
      allowOpenedReturns: policy.allowOpenedReturns,
      autoApprovalLimit: policy.autoApprovalLimit,
    };
  }

  if (name === 'add_to_cart') {
    const q = (args.productName || '').toLowerCase();
    const qty = args.quantity || 1;
    const p = MOCK_PRODUCTS.find((item) => item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q));
    if (p) {
      return {
        added: true,
        product: { id: p.id, name: p.name, price: p.price },
        quantity: qty,
        message: `Successfully added ${qty}x ${p.name} (₹${p.price}) to cart.`,
      };
    }
    return { added: false, message: `Could not find product matching '${args.productName}'.` };
  }

  return { error: 'Unknown tool' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, memory, activeStoreId, language = 'en' } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Deterministic fallback if API key is unconfigured
      const contextResult = await retrievalService.retrieveContext(query, activeStoreId, memory);
      return NextResponse.json({
        success: true,
        provider: 'riva-engine-fallback',
        ...contextResult,
      });
    }

    const languageNames: Record<string, string> = {
      kn: 'Kannada (ಕನ್ನಡ)',
      hi: 'Hindi (हिन्दी)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      ml: 'Malayalam (മലയാളം)',
      mr: 'Marathi (मराठी)',
      bn: 'Bengali (বাংলা)',
      en: 'English',
      auto: 'the same language as the user query (Automatic Detection)',
    };

    const targetLangInstruction = languageNames[language] || 'the language of the user query';

    const systemPrompt = `You are RIVA, an intelligent, non-robotic in-store FMCG Retail AI Copilot.

Tone & Persona:
- Speak naturally, warmly, concisely, and conversationally like ChatGPT.
- You can answer general conversational questions, explain concepts (e.g. FMCG, milk processing, recipe ideas), recommend food items, and help users shop.
- NEVER use robotic phrases like "According to our database", "Based on the provided context", or "As an AI assistant".
- Respond fluently in ${targetLangInstruction}. If the query is in Kannada, Hindi, Tamil, Telugu, Malayalam, Marathi, Bengali, or English, respond in that language.

Tools & Grounding:
- For store queries (product stock, prices, locations, policies, cart actions), call available tools!
- Keep exact tool values: Prices in ₹, exact stock numbers, aisle and shelf tags.
- Convert tool results into warm, natural, human sentences. Never show JSON outputs to users.`;

    const messagesArray: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ];

    // Initial call to OpenAI with Tool Definitions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messagesArray,
        tools: RIVA_TOOLS,
        tool_choice: 'auto',
        temperature: 0.3,
        max_tokens: 450,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const choice = data.choices?.[0];
      const message = choice?.message;

      let matchedProducts: Product[] = [];

      // Check if OpenAI decided to call a Tool
      if (message?.tool_calls && message.tool_calls.length > 0) {
        messagesArray.push(message);

        for (const toolCall of message.tool_calls) {
          const fnName = toolCall.function.name;
          const fnArgs = JSON.parse(toolCall.function.arguments || '{}');
          const toolResult = await executeRivaTool(fnName, fnArgs, memory);

          if (fnName === 'search_products' && toolResult.products) {
            matchedProducts = toolResult.products as any[];
          }

          messagesArray.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }

        // Second call to OpenAI to synthesize final answer with Tool execution results
        const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messagesArray,
            temperature: 0.3,
            max_tokens: 400,
          }),
        });

        if (secondResponse.ok) {
          const secondData = await secondResponse.json();
          const finalAnswer = secondData.choices?.[0]?.message?.content || 'I retrieved the product data for you.';

          return NextResponse.json({
            success: true,
            provider: 'openai-tool-calls',
            suggestedResponse: finalAnswer,
            matchedProducts: matchedProducts.length > 0 ? matchedProducts : (await retrievalService.retrieveContext(query, activeStoreId, memory)).matchedProducts,
            suggestedFollowUps: ['Add to my cart', 'Where is it located?', 'Show cheap options', 'Can I return this?'],
          });
        }
      }

      // If no tool was called (e.g. general question), return direct answer
      const directAnswer = message?.content || (await retrievalService.retrieveContext(query, activeStoreId, memory)).suggestedResponse;
      return NextResponse.json({
        success: true,
        provider: 'openai-direct',
        suggestedResponse: directAnswer,
        matchedProducts: (await retrievalService.retrieveContext(query, activeStoreId, memory)).matchedProducts,
        suggestedFollowUps: ['Show dairy products', 'Find snacks under ₹100', 'Where is Amul milk?'],
      });
    }

    // Default fallback
    const fallbackContext = await retrievalService.retrieveContext(query, activeStoreId, memory);
    return NextResponse.json({
      success: true,
      provider: 'riva-engine-fallback',
      ...fallbackContext,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    const fallbackContext = await retrievalService.retrieveContext('help', undefined, {});
    return NextResponse.json({
      success: true,
      provider: 'riva-engine-fallback',
      ...fallbackContext,
    });
  }
}
