import { NextRequest, NextResponse } from 'next/server';
import { retrievalService } from '@/services/mock';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, memory, activeStoreId, language = 'en' } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // 1. Retrieve RIVA Retail Context (Products, Policies, Inventory, Intent)
    const contextResult = await retrievalService.retrieveContext(query, activeStoreId, memory);

    // 2. Check for external LLM provider key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback: Deterministic RIVA engine response
      return NextResponse.json({
        success: true,
        provider: 'riva-engine-fallback',
        ...contextResult,
      });
    }

    // Language Mapping Hint for OpenAI system prompt
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

    // 3. Synthesize natural answer using OpenAI GPT-4o-mini
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are RIVA, an intelligent in-store FMCG Retail Assistant. 
Language Instruction: Automatically detect the language of the user's message OR respond in ${targetLangInstruction}. If the query is in Kannada, Hindi, Tamil, Telugu, Malayalam, Marathi, Bengali, or English, answer fluently in that language.
Context Summary: ${contextResult.suggestedResponse}
Intent Identified: ${contextResult.intent}
Matched Products: ${JSON.stringify(contextResult.matchedProducts.map((p) => ({ name: p.name, brand: p.brand, price: p.price, stock: p.stock, location: p.location })))}

Guidelines:
1. Always keep numerical values exact: Price in ₹, stock units, aisle and shelf numbers.
2. Keep brand/product names clear and recognizable (e.g. Amul, Tata Tea, Maggi).
3. Be friendly, concise, natural, and helpful.`,
            },
            {
              role: 'user',
              content: query,
            },
          ],
          temperature: 0.3,
          max_tokens: 350,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const llmAnswer = data.choices?.[0]?.message?.content || contextResult.suggestedResponse;
        return NextResponse.json({
          success: true,
          provider: 'openai-llm',
          ...contextResult,
          suggestedResponse: llmAnswer,
        });
      }
    } catch (llmErr) {
      console.warn('OpenAI API call failed, falling back to RIVA deterministic engine:', llmErr);
    }

    // Fallback return
    return NextResponse.json({
      success: true,
      provider: 'riva-engine-fallback',
      ...contextResult,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
