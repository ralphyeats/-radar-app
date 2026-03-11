export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const url = `https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=-300&geo=US&ns=15`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    const text = await response.text();
    const clean = text.replace(")]}'\n", '');
    const data = JSON.parse(clean);
    const stories = data.default?.trendingSearchesDays || [];
    const kwLow = q.toLowerCase();
    
    for (const day of stories) {
      for (const search of day.trendingSearches || []) {
        const title = (search.title?.query || '').toLowerCase();
        const traffic = parseInt((search.formattedTraffic || '0').replace(/[^0-9]/g, '')) || 0;
        if (title.includes(kwLow)) {
          return res.status(200).json({ trending: true, title: search.title.query, traffic, score: Math.min(15, Math.round(traffic / 50000)) });
        }
      }
    }
    return res.status(200).json({ trending: false, score: 0 });
  } catch (e) {
    return res.status(200).json({ trending: false, score: 0, error: e.message });
  }
}
