export default {
  async fetch(request, env) {

    // 允许跨域
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // AI 接口路由
    if (url.pathname === '/guide' && request.method === 'POST') {
      try {
        const { hero, question } = await request.json();

        const prompt = `You are a Marvel Rivals expert coach. The player is asking about the hero "${hero}". Their question: "${question}". Give a concise, practical strategy answer in 3-5 sentences. Be specific and helpful.`;

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
          }),
        });

        const data = await res.json();
        const answer = data?.choices?.[0]?.message?.content || 'No response received.';

        return new Response(JSON.stringify({ answer }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 其他路由返回 404
    return new Response('Not found', { status: 404 });
  }
};
