const Router = require('express')
const router = new Router()
const folderController = require('../controllers/folderController')

router.get('/get', folderController.getFolder)
router.post('/create', folderController.createFolder)
router.put('/updateName', folderController.updateFolderName)
router.put('/updateParent', folderController.updateFolderParent)
router.delete('/delete', folderController.deleteFolder)

module.exports = router