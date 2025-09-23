module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  
  try {
    const { password } = req.body;
    const realPassword = process.env.ADMIN_PASSWORD;

    if (!realPassword) {
      throw new Error("서버에 비밀번호가 설정되지 않았습니다.");
    }

    if (password === realPassword) {
      res.status(200).json({ success: true, message: '인증 성공' });
    } else {
      res.status(401).json({ success: false, message: '비밀번호가 틀렸습니다.' });
    }
  } catch (error) {
    console.error("Check-password function error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
