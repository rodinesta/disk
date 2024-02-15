const Router = require('express')
const router = new Router()

const userRouter = require('./userRouter')
const folderRouter = require('./folderRouter')
const fileRouter = require('./fileRouter')

router.use('/user', userRouter)
router.use('/folder', folderRouter)
router.use('/file', fileRouter)

module.exports = router