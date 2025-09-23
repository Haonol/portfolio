const { Redis } = require('@upstash/redis');

// Vercel이 자동으로 설정해준 환경 변수 이름을 읽도록 수정
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  try {
    const data = await redis.get('portfolioData');
    return res.status(200).json(data);
  } catch (error) {
    console.error("Get-data function error:", error);
    return res.status(500).json({ error: '데이터를 불러오는 데 실패했습니다.' });
  }
};