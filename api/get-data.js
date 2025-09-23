const { Redis } = require('@upstash/redis');

// Vercel 환경 변수에서 연결 정보를 가져와 Redis 클라이언트를 생성합니다.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  try {
    // 'portfolioData'라는 키로 저장된 데이터를 가져옵니다.
    const data = await redis.get('portfolioData');
    res.status(200).json(data);
  } catch (error) {
    console.error("Get-data function error:", error);
    res.status(500).json({ error: '데이터를 불러오는 데 실패했습니다.' });
  }
};