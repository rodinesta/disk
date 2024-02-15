require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const router = require('./routes')
const errorHandler = require('./middleware/errorHandler')
const PORT = process.env.PORT

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload())
app.use('/api', router)
app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started at port ${PORT}`))
    } catch (e) {
        console.log(e);
    }
}

start()