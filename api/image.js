export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt } = req.query;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const query = encodeURIComponent(prompt);
    const url = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;

    const r = await fetch(url);
    if (!r.ok) throw new Error(`Unsplash error: ${r.status}`);

    const data = await r.json();
    const imgUrl = data?.urls?.regular || data?.urls?.full;
    if (!imgUrl) throw new Error('No image returned');

    // Fetch the actual image and pipe it through
    const imgRes = await fetch(imgUrl);
    const buffer = await imgRes.arrayBuffer();
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error('Image proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
