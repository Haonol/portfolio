const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  try {
    const data = await kv.get('portfolioData');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: '데이터를 불러오는 데 실패했습니다.' });
  }
};