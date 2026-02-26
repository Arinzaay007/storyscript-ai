export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt } = req.query;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const query = encodeURIComponent(prompt);
    const r = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&orientation=landscape&per_page=1`,
      { headers: { Authorization: process.env.PEXELS_API_KEY } }
    );

    const data = await r.json();
    if (!r.ok) throw new Error(`Pexels error: ${r.status}`);

    const imgUrl = data?.photos?.[0]?.src?.large2x || data?.photos?.[0]?.src?.large;
    if (!imgUrl) throw new Error('No image found for: ' + prompt);

    return res.status(200).json({ url: imgUrl });

  } catch (err) {
    console.error('Image proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
