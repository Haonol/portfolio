exports.handler = async function(event) {
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
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: '인증 성공' })
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ success: false, message: '비밀번호가 틀렸습니다.' })
            };
        }
    } catch (error) {
        console.error('Check-password function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: error.message })
        };
    }
};
