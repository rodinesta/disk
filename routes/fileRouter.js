const Router = require('express')
const router = new Router()
const fileController = require('../controllers/fileController')

router.post('/upload', fileController.upload)
router.delete('/delete', fileController.delete)

module.exports = router