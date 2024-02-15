const { validationResult } = require('express-validator')
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const { User } = require('../models/models')
const tokenController = require('./tokenController')
const mailController = require('./mailController')
const folderController = require('./folderController')

class UserController {
    async signUp(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessage = errors.array().map(error => `${error.msg}`).join(', ')
                return next(ApiError.badRequest(`Ошибка при валидации: ${errorMessage}`))
            }

            const { name, surname, middlename, email, username, password } = req.body

            const candidateLogin = await User.findOne({ where: { username } })
            if (candidateLogin) return next(ApiError.badRequest('Пользователь с таким логином уже существует'))
            const candidateEmail = await User.findOne({ where: { email } })
            if (candidateEmail) return next(ApiError.badRequest('Почта уже зарегистрирована'))
            
            const hashPassword = await bcrypt.hash(password, 5)
            const user = await User.create({ name, surname, middlename, email, username, password: hashPassword })

            await folderController.createNewUserFolder(user.id)

            const tokens = tokenController.generateTokens({ userId: user.id, username: user.username })
            await tokenController.saveToken(user.id, tokens.refreshToken)

            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true})
            await mailController.sendConfirmMail(email, `${process.env.API_URL}/api/user/activate/${user.id}`)

            return res.json({ tokens });
        } catch (e) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async login(req, res, next) {
        try {
            const { username, password } = req.body
            const user = await User.findOne({ where: { username } })
            if (!user) return next(ApiError.badRequest('Пользователь с таким логином не найден'))
    
            let comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword) return next(ApiError.badRequest('Неверный пароль'))
            const tokens = tokenController.generateTokens({ userId: user.id, username: user.username })
            await tokenController.saveToken(user.id, tokens.refreshToken)

            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json({ tokens })
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
        
    }

    //  Здесь следует заменить userId на нормальную ссылку, но ее нужно где то хранить... (вероятно в самом юзере)))
    async activate(req, res, next) {
        try {
            const {link} = req.params
            const user = await User.findOne({where: {id: link}})
            user.is_confirmed = true
            await user.save()
    
            return res.json({ msg: user.is_confirmed })
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    //  Здесь следует заменить userId на нормальную ссылку, но ее нужно где то хранить... (вероятно в самом юзере)))
    async sendResetPasswordLink(req, res, next) {
        try {
            const {link} = req.params
            const user = await User.findOne({where: {id: link}})
            await mailController.sendResetPasswordMail(user.email, `${process.env.API_URL}/api/user/resetPassword/${user.id}`)

            return res.json({ msg: "Mail sent" })
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    //  Здесь следует заменить userId на нормальную ссылку, но ее нужно где то хранить... (вероятно в самом юзере)))
    async setNewPassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessage = errors.array().map(error => `${error.msg}`).join(', ')
                return next(ApiError.badRequest(`Ошибка при валидации: ${errorMessage}`))
            }

            const {link} = req.params
            const {password} = req.body
            const user = await User.findOne({where: {id: link}})

            const hashPassword = await bcrypt.hash(password, 5)
            user.password = hashPassword
            await user.save()

            return res.json({ user })
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

}

module.exports = new UserController();