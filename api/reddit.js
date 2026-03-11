export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { q, t, limit } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&limit=${limit||50}&t=${t||'day'}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RadarApp/1.0 (meme token detector)',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Reddit API error' });
    }
    
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
