const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Vercel의 Node.js 런타임에서는 req.body가 자동으로 파싱됩니다.
    const { password, data } = req.body;
    const realPassword = process.env.ADMIN_PASSWORD;

    if (password !== realPassword) {
      return res.status(401).json({ error: '비밀번호가 틀렸습니다.' });
    }

    await kv.set('portfolioData', data);
    res.status(200).json({ success: true, message: '데이터가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error("Save-data function error:", error);
    res.status(500).json({ error: '데이터 저장에 실패했습니다.' });
  }
};
