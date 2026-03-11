export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const url = `https://frontend-api.pump.fun/coins?offset=0&limit=50&sort=created_timestamp&order=DESC&includeNsfw=false`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    const data = await response.json();
    if (!Array.isArray(data)) return res.status(200).json({ found: false, score: 0 });

    const kwLow = q.toLowerCase();
    const match = data.find(c => 
      (c.name || '').toLowerCase().includes(kwLow) || 
      (c.symbol || '').toLowerCase().includes(kwLow)
    );

    if (!match) return res.status(200).json({ found: false, score: 0 });

    const age = Math.max(1, Math.round((Date.now() / 1000 - (match.created_timestamp || 0)) / 3600));
    const score = age < 1 ? 15 : age < 6 ? 10 : age < 24 ? 5 : 2;

    return res.status(200).json({
      found: true, score,
      name: match.name,
      symbol: match.symbol,
      marketCap: Math.round(match.usd_market_cap || 0),
      age
    });
  } catch (e) {
    return res.status(200).json({ found: false, score: 0, error: e.message });
  }
}
