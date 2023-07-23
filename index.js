const express = require('express')
const db = require('./models')
require('dotenv').config()
const { userRouter, authRouter, blogRouter, imageRouter } = require('./routers')

const PORT = 7799
const app = express()

app.use(express.json())
app.use(express.static('./Public'))

app.get("/", (req, res) => {
    res.status(200).send("Success")
})

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/blog', blogRouter)
app.use('/api', imageRouter)

app.listen(PORT, () => {
    // db.sequelize.sync({ alter: true })
    console.log(`This server is running on port ${PORT}`);
})