const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { password, data } = req.body;
    const realPassword = process.env.ADMIN_PASSWORD;

    if (password !== realPassword) {
      return res.status(401).json({ error: '비밀번호가 틀렸습니다.' });
    }

    // 'portfolioData'라는 키에 새로운 데이터를 저장합니다.
    await redis.set('portfolioData', data);
    
    res.status(200).json({ success: true, message: '데이터가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error("Save-data function error:", error);
    res.status(500).json({ error: '데이터 저장에 실패했습니다.' });
  }
};