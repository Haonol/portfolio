const { Redis } = require('@upstash/redis');

// Vercel이 자동으로 설정해준 환경 변수 이름을 읽도록 수정
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { password, data } = req.body;
    const realPassword = process.env.ADMIN_PASSWORD;

    if (!realPassword) {
      console.error("ADMIN_PASSWORD is not set in Vercel environment variables.");
      return res.status(500).json({ error: '서버에 비밀번호가 설정되지 않았습니다.' });
    }
    if (password !== realPassword) {
      return res.status(401).json({ error: '비밀번호가 틀렸습니다.' });
    }

    await redis.set('portfolioData', data);
    return res.status(200).json({ success: true, message: '데이터가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error("Save-data function error:", error);
    return res.status(500).json({ error: '데이터 저장 중 서버에서 오류가 발생했습니다.' });
  }
};