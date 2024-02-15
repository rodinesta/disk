const jwt = require('jsonwebtoken')
const { Token } = require('../models/models')

class TokenController {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
        return {accessToken, refreshToken}
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            return userData
        } catch (e) {
            return console.log(e)
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
            return userData
        } catch (e) {
            return console.log(e)
        }
    }

    //  Стоит задуматься о механизме удаления истекших токенов из БД (сервис с таймером)
    async saveToken(userId, refreshToken) {
        const tokenData = await Token.findOne({where: userId})

        const token = await Token.create({userId: userId, refreshToken})
        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await Token.deleteOne({refreshToken})
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await Token.findOne({refreshToken})
        return tokenData;
    }
}

module.exports = new TokenController()