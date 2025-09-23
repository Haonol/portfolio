const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  try {
    const store = getStore('portfolioDataStore');
    // 'main' 키로 저장된 데이터를 JSON 형태로 가져옵니다.
    const data = await store.get('main', { type: 'json' });

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Get-data function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '데이터를 불러오는 데 실패했습니다.' }),
    };
  }
};
