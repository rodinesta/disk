const TokenController = require("../controllers/tokenController");
const getTokenDataFromCookie = (cookie) => {
    const cookieString = cookie.split(';');
    const token = cookieString.map((part) => {
        const [key, value] = part.trim().split('=');
        if (key === 'refreshToken') {
            return value;
        }
    })
    return TokenController.validateRefreshToken(token.join(''))
}

module.exports = { getTokenDataFromCookie }