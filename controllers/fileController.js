const ApiError = require('../error/ApiError')
const {File, Folder, User} = require('../models/models')
const fs = require('fs')
const path = require('path')
const uuid = require('uuid')
const { getTokenDataFromCookie } = require("../tools/getTokenDataFromCookie");

class FileController {
    async upload (req, res, next) {
        try {
            const {name, folderId} = req.body
            const {file} = req.files

            const cookie = req.headers.cookie
            if (!cookie) return next(ApiError.badRequest('No cookies'))
            const decodedToken = getTokenDataFromCookie(cookie)
            const userId = decodedToken.userId

            const parentFolder = await Folder.findOne({where: {id: folderId}})
            if (!parentFolder) return next(ApiError.badRequest('Папка не найдена'))
            if (parentFolder.userId !== userId) return next(ApiError.badRequest('Попытка загрузки файла в чужую папку'))

            const fileName = uuid.v4() + '.' + file.name.split('.')[1]
            const filePath = path.resolve('static', fileName)

            const uploadedFile = await File.create({name, folderId, userId, filePath})
            file.mv(filePath)
            return res.json(uploadedFile)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async delete (req, res, next) {
        try {
            const {id} = req.body
            const cookie = req.headers.cookie
            if (!cookie) return next(ApiError.badRequest('No cookies'))
            const decodedToken = getTokenDataFromCookie(cookie)
            const userId = decodedToken.userId

            const file = await File.findOne({where: {id}})
            if (!file) return next(ApiError.badRequest('Файл не найден'))
            if (file.userId !== userId) return next(ApiError.badRequest('Попытка удаления чужого файла'))

            fs.unlink(file.filePath, error => {
                if (error) return next(ApiError.badRequest(error))
                console.log(`${file.filePath} deleted`)
            })

            return res.json(await File.destroy({where: {id}}))

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new FileController()