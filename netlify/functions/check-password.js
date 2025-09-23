// 이 파일은 Netlify 서버에서 실행됩니다.
// process.env.ADMIN_PASSWORD는 Netlify에 설정할 환경 변수를 가리킵니다.

exports.handler = async function(event, context) {
    // POST 요청이 아니면 거부
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { password } = JSON.parse(event.body);
        const realPassword = process.env.ADMIN_PASSWORD;

        if (!realPassword) {
            throw new Error("서버에 비밀번호가 설정되지 않았습니다.");
        }

        if (password === realPassword) {
            // 비밀번호가 맞으면 성공 응답
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: '인증 성공' })
            };
        } else {
            // 비밀번호가 틀리면 실패 응답
            return {
                statusCode: 401,
                body: JSON.stringify({ success: false, message: '비밀번호가 틀렸습니다.' })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: error.message })
        };
    }
};