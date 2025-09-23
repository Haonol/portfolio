const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  try {
    const data = await kv.get('portfolioData');
    // Vercel KV에서 데이터가 없을 경우 null을 반환하므로, 그대로 전달합니다.
    res.status(200).json(data);
  } catch (error) {
    console.error("Get-data function error:", error);
    res.status(500).json({ error: '데이터를 불러오는 데 실패했습니다.' });
  }
};
