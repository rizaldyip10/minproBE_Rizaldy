const db = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const user = db.User
const { Op, where } = require('sequelize')
const fs = require('fs')
const handlebars = require('handlebars')
const transporter = require('../middlewares/transporter')

module.exports = {
    changePass: async (req, res) => {
        try {
            const { currentPassword, password, confirmPassword } = req.body
            const checkPass = await user.findOne({
                where: {
                    id: req.user.id
                }
            })

            const isValid = await bcrypt.compare(currentPassword, checkPass.password)
            if (!isValid) throw { message: "Incorrect current password" }
            if (password !== confirmPassword) throw { message: "Password did not match" }
            if (currentPassword === password) throw { message: "New password can not be the same as old password"}

            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)

            const result = await user.update({password: hashPassword}, {
                where: {
                    id: req.user.id
                }
            })

            const message = "You have successfuly change your password."

            const data = await fs.readFileSync('./change.html', 'utf-8')
            const tempCompile = await handlebars.compile(data)
            const tempResult = tempCompile({ username: result.username, message })

            await transporter.sendMail({
                from: process.env.TRANSPORTER_EMAIL,
                to: checkPass.email,
                subject: 'Change password notification',
                html: tempResult
            })

            res.status(200).send({
                message: "Password successfuly changed",
            })
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    },
    changeUsername: async (req, res) => {
        try {
            const { currentUsername, username } = req.body
            
            const checkUsername = await user.findOne({
                where: {
                    id: req.user.id
                }
            })

            if (currentUsername !== checkUsername.username) throw { message: "Incorrect username" }
            const isUsernameExist = await user.findOne({
                where: {
                    username
                }
            })
            if (isUsernameExist) throw { message: "Username already taken" }

            const result = await user.update({username: username}, {
                where: {
                    id: req.user.id
                }
            })

            const message = "You have successfuly change your username."

            const data = await fs.readFileSync('./change.html', 'utf-8')
            const tempCompile = await handlebars.compile(data)
            const tempResult = tempCompile({ username: result.username, message })

            await transporter.sendMail({
                from: process.env.TRANSPORTER_EMAIL,
                to: checkUsername.email,
                subject: 'Change username notification',
                html: tempResult
            })

            res.status(200).send({
                message: "Username successfuly changed"
            })
        } catch (err) {
            res.status(400).send(err)
        }
    },
    changePhone: async (req, res) => {
        try {
            const { currentPhone, phone } = req.body
            
            const checkPhone = await user.findOne({
                where: {
                    id: req.user.id
                }
            })
            if (currentPhone !== checkPhone.phone) throw { message: "Incorrect phone number" }

            const result = await user.update({phone: phone}, {
                where: {
                    id: req.user.id
                }
            })

            const message = "You have successfuly change your phone number."

            const data = await fs.readFileSync('./change.html', 'utf-8')
            const tempCompile = await handlebars.compile(data)
            const tempResult = tempCompile({ username: result.username, message })

            await transporter.sendMail({
                from: process.env.TRANSPORTER_EMAIL,
                to: checkPhone.email,
                subject: 'Change phone number notification',
                html: tempResult
            })

            res.status(200).send({
                message: "Phone number successfuly changed"
            })
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    }, 
    changeEmail: async (req, res) => {
        try {
            const { currentEmail, email } = req.body
            
            const checkEmail = await user.findOne({
                where: {
                    id: req.user.id
                }
            })

            if (currentEmail !== checkEmail.email) throw { message: "Incorrect email" }
            const isEmailExist = await user.findOne({
                where: {
                    email
                }
            })
            if (isEmailExist) throw { message: "Email already taken" }

            const payload = { username: checkEmail.username }
            const token = jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: "1h"} )

            const result = await user.update({ email: email, isVerified: false, regisToken: token }, {
                where: {
                    id: req.user.id
                }
            })

            const message = "You have changed your email. Please click the link below to confirm your email address:"

            const data = await fs.readFileSync('./verify.html', 'utf-8')
            const tempCompile = await handlebars.compile(data)
            const tempResult = tempCompile({ username: result.username, token, message })

            await transporter.sendMail({
                from: process.env.TRANSPORTER_EMAIL,
                to: currentEmail,
                subject: 'Change email confirmation',
                html: tempResult
            })

            res.status(200).send({
                message: "Email successfuly changed, please check your email to verify",
                token
            })
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    },
    changePic: async (req, res) => {
        try {
            if (!req.file) throw { message: "Please choose your profile image" }

            await user.update({ imageProfile: req.file.filename }, {
                where: {
                    id: req.user.id
                }
            })

            res.status(200).send({
                status: true,
                message: "Successfuly change profile picture"
            })
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    },
    removeProfilePic: async (req, res) => {
        try {
            await user.update({ imageProfile: null }, {
                where: {
                    id: req.user.id
                }
            })

            res.status(200).send({
                message: "Profile picture removed"
            })
        } catch (err) {
            res.status(400).send(err);
        }
    }
}