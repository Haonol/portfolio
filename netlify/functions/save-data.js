const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { password, data } = JSON.parse(event.body);
    const realPassword = process.env.ADMIN_PASSWORD;

    // 비밀번호 확인
    if (password !== realPassword) {
      return { statusCode: 401, body: JSON.stringify({ error: '비밀번호가 틀렸습니다.' }) };
    }

    const store = getStore('portfolioDataStore');
    // 'main' 키에 새로운 데이터를 JSON 형태로 저장합니다.
    await store.setJSON('main', data);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: '데이터가 성공적으로 저장되었습니다.' }),
    };
  } catch (error) {
    console.error('Save-data function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '데이터 저장에 실패했습니다.' }),
    };
  }
};
