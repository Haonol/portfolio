import { getStore } from '@netlify/blobs';

export const handler = async () => {
  try {
    const store = getStore('portfolioDataStore');
    const data = await store.get('main', { type: 'json' });

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '데이터를 불러오는 데 실패했습니다.' }),
    };
  }
};