import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { password, data } = await req.json();
    const realPassword = process.env.ADMIN_PASSWORD;

    if (password !== realPassword) {
      return NextResponse.json({ error: '비밀번호가 틀렸습니다.' }, { status: 401 });
    }

    await kv.set('portfolioData', data);
    return NextResponse.json({ success: true, message: '데이터가 성공적으로 저장되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: '데이터 저장 중 서버에서 오류가 발생했습니다.' }, { status: 500 });
  }
}
