const db = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const user = db.User
const { Op, where } = require('sequelize')
const transporter = require('../middlewares/transporter')
const fs = require('fs')
const handlebars = require('handlebars')

module.exports = {
    register: async (req, res) => {
        try {
            const { username, email, phone, password, confirmPassword } = req.body

            if (password !== confirmPassword) throw { message: "Password did not match" }

            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)
            
            const payload = { username }
            const token = jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: "20m"} )

            const result = await user.create({ username, email, phone, password: hashPassword, regisToken: token })

            const message = "Thank you for registering to Bloggerspot"

            const data = await fs.readFileSync('./verify.html', 'utf-8')
            const tempCompile = await handlebars.compile(data)
            const tempResult = tempCompile({ username, token, message })

            await transporter.sendMail({
                from: process.env.TRANSPORTER_EMAIL,
                to: email,
                subject: 'Registration email confirmation',
                html: tempResult
            })

            res.status(200).send({
                status: true,
                result,
                token
            })
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    },
    login: async (req, res) => {
        try {
            const username = req.body.username || ""
            const email = req.body.email || ""
            const phone = req.body.phone || ""
            const password = req.body.password
            
            const result = await user.findOne({
                where: {
                    [Op.or]: [
                        { username },
                        { email },
                        { phone }
                    ]
                }
            })
            if (!result) throw { message: "Account not found" }

            const isValid = await bcrypt.compare(password, result.password)
            if (!isValid) throw { message: "Incorrect password" }

            if(!result.isVerified) throw { message: "Account is not verified" }

            let payload = { id: result.id, imageProfile: result.imageProfile }
            const token = jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: '3d' })

            res.status(200).send({
                message: "Login Success, welcome!",
                isAccountExist: result,
                token
            })
        } 
        catch (err) {
            res.status(400).send(err)
        }
    },
    verify: async (req, res) => {
        try {

            if (req.user.id) throw { message: "invalid token" }
            
            const checkVerify = await user.findOne({
                where: {
                    username: req.user.username
                }
            })

            if (req.token !== checkVerify.regisToken) throw { message: "Account already verified" }

            // if (checkVerify.isVerified) throw { message: "Account already verified" }

            await user.update({ isVerified: true, regisToken: null }, {
                where: {
                    username: req.user.username
                }
            })
            res.status(200).send({
                message: "Verification success!"
            })
        } catch (err) {
            res.status(400).send(err)
        }
    },
    keepLogin: async (req, res) => {
        try {
            const result = await user.findOne({
                where: {
                    id: req.user.id
                }
            })
            res.status(200).send(result)
        } catch (err) {
            res.status(400).send(err)
        }
    },
    forgetPassword: async (req, res) => {
        try {
            const isEmailExist = await user.findOne({
                where: {
                    email: req.body.email
                }
            })
            if (!isEmailExist) throw { message: "Email not found" }

            const payload = { email: req.body.email }
            const token = jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: "1h" })

            const message = "Reset Password Confirmation"

            const data = await fs.readFileSync('./reset.html', 'utf-8')
            const tempCompile = await handlebars.compile(data)
            const tempResult = tempCompile({ token, message })

            await transporter.sendMail({
                from: process.env.TRANSPORTER_EMAIL,
                to: req.body.email,
                subject: 'Reset password confirmation',
                html: tempResult
            })

            res.status(200).send({
                message: "We have sent you email verification, please check your email",
                token
            })
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    },
    resetPassword: async (req, res) => {
        try {
            if (req.body.password !== req.body.confirmPassword) throw { message: "Password did not match" }

            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(req.body.password, salt)

            await user.update({ password: hashPassword }, {
                where: {
                    email: req.user.email
                }
            })
            
            res.status(200).send({
                message: "Password successfuly changed"
            })
        } catch (err) {
            res.status(400).send(err)
        }
    },
}