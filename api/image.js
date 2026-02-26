export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, seed } = req.query;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&seed=${seed||Math.floor(Math.random()*9999)}&nologo=true&model=flux`;
    
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error(`Pollinations error: ${imgRes.status}`);

    const buffer = await imgRes.arrayBuffer();
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error('Image proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
