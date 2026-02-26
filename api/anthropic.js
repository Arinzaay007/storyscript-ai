export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, max_tokens } = req.body;

    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://storyscript-ai.vercel.app',
        'X-Title': 'StoryScript AI'
      },
      body: JSON.stringify({
        model: 'google/gemma-3-4b-it:free',
        max_tokens: max_tokens || 1400,
        messages: messages
      })
    });

    const data = await orRes.json();

    if (!orRes.ok) {
      console.error('OpenRouter error:', data);
      return res.status(orRes.status).json({ error: data.error?.message || 'OpenRouter error' });
    }

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content: [{ type: 'text', text }] });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
