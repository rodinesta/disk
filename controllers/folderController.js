const ApiError = require('../error/ApiError')
const {Folder, File, User} = require('../models/models')
const TokenController = require("./tokenController");
const { getTokenDataFromCookie } = require('../tools/getTokenDataFromCookie')

class FolderController {
    async createNewUserFolder(userId) {
        await Folder.create({name: "root", userId: userId})
    }

    async createFolder (req, res, next) {
        try {
            const {name, parentId} = req.body
            const cookie = req.headers.cookie
            if (!cookie) return next(ApiError.badRequest('No cookies'))

            const decodedToken = getTokenDataFromCookie(cookie)
            const userId = decodedToken.userId

            const parentFolder = await Folder.findOne({where: {id: parentId}})
            if (!parentFolder || parentFolder.userId !== userId) return next(ApiError.badRequest('Попытка доступа к несуществующей/чужой папке'))

            const existFolders = await Folder.findOne({where: {name, parentId}})
            if (existFolders) return next(ApiError.badRequest('Папка с заданным именем уже существует'))

            const folder = await Folder.create({name, parentId, userId})

            return res.json({ folder })
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async updateFolderName (req, res, next) {
        try {
            const {id, newName} = req.body
            const cookie = req.headers.cookie
            if (!cookie) return next(ApiError.badRequest('No cookies'))

            const decodedToken = getTokenDataFromCookie(cookie)

            const folder = await Folder.findOne({where: {id}})
            if (!folder) return next(ApiError.badRequest('Папка с заданным именем не существует'))
            if (folder.userId !== decodedToken.userId) return next(ApiError.badRequest('Попытка поменять имя чужой папки'))
            if (folder.parentId === null) return next(ApiError.badRequest('Попытка изменения корневой папки'))

            const existFolder = await Folder.findOne({where: {name: newName}})
            if (existFolder) return next(ApiError.badRequest('Папка с таким именем уже существует'))

            folder.name = newName

            return res.json(await folder.save())
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async updateFolderParent (req, res, next) {
        try {
            const {id, newParentId} = req.body
            const cookie = req.headers.cookie
            if (!cookie) return next(ApiError.badRequest('No cookies'))

            const decodedToken = getTokenDataFromCookie(cookie)

            const folder = await Folder.findOne({where: {id}})
            if (!folder) return next(ApiError.badRequest('Папка с заданным именем не существует'))
            if (folder.userId !== decodedToken.userId) return next(ApiError.badRequest('Попытка поменять родителя чужой папки'))
            if (folder.parentId === null) return next(ApiError.badRequest('Попытка изменения корневой папки'))

            const parentFolder = await Folder.findOne({where: {id: newParentId}})
            if (!parentFolder) return next(ApiError.badRequest('Родительской папки не существует'))

            const candidateFolder = await Folder.findOne({where: {name: folder.name, parentId: newParentId}})
            if (candidateFolder) return next(ApiError.badRequest('Папка с таким именем уже существует'))

            folder.parentId = newParentId

            return res.json(await folder.save())
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async deleteFolder (req, res, next) {
        try {
            const {id} = req.body
            const cookie = req.headers.cookie
            if (!cookie) return next(ApiError.badRequest('No cookies'))
            const decodedToken = getTokenDataFromCookie(cookie)

            const folder = await Folder.findOne({where: {id}})
            if (!folder) return next(ApiError.badRequest('Папка не найдена'))
            if (folder.userId !== decodedToken.userId) return next(ApiError.badRequest('Попытка удаления чужой папки'))
            if (folder.parentId === null) return next(ApiError.badRequest('Попытка удаления корневой папки'))

            const deleteChildFolders = async (parentId) => {
                const childFolders = await Folder.findAll({ where: { parentId } })
                for (const childFolder of childFolders) {
                    await deleteChildFolders(childFolder.id)
                    await File.destroy({where: {folderId: childFolder.id}})
                    await Folder.destroy({ where: { id: childFolder.id } })
                }
            }
            await deleteChildFolders(id)
            await File.destroy({where: {folderId: id}})
            await Folder.destroy({where: {id}})

            return res.json(`Папка ${folder.name} удалена со всеми дочерними папками и элементами`)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getFolder (req, res, next){
        try {
            const {id} = req.body
            const folder = await Folder.findOne(
                {
                    where: {id},
                    include: [
                        {
                            model: File
                        },
                        {
                            model: Folder,
                            as: 'children'
                        }
                    ]
                })

            return res.json(folder)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new FolderController();