import { NextRequest, NextResponse } from 'next/server';
import { retrievalService } from '@/services/mock';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, memory, activeStoreId } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // 1. Retrieve RIVA Retail Context (Products, Policies, Inventory, Intent)
    const contextResult = await retrievalService.retrieveContext(query, activeStoreId, memory);

    // 2. Check for optional external LLM provider key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback: Deterministic RIVA engine response
      return NextResponse.json({
        success: true,
        provider: 'riva-engine-fallback',
        ...contextResult,
      });
    }

    // 3. If OPENAI_API_KEY is present, synthesize answer using OpenAI API
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
              content: `You are RIVA, an intelligent FMCG Retail Assistant. Use the provided store context to answer accurately. 
Context Summary: ${contextResult.suggestedResponse}
Intent Identified: ${contextResult.intent}
Matched Products: ${JSON.stringify(contextResult.matchedProducts.map((p) => ({ name: p.name, brand: p.brand, price: p.price, stock: p.stock, location: p.location })))}`,
            },
            {
              role: 'user',
              content: query,
            },
          ],
          temperature: 0.3,
          max_tokens: 300,
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

    // Default return
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
