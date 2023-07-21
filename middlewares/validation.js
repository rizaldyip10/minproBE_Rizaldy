const { body, validationResult, oneOf } = require('express-validator')
const fs = require('fs')

module.exports = {
    checkRegister: async (req, res, next) => {
        try {
            await body('username')
                .notEmpty().withMessage("Username cannot be empty")
                .run(req)
            await body('email')
                .notEmpty().withMessage("Email cannot be empty")
                .isEmail().withMessage("Invalid email")
                .run(req)
            await body('phone')
                .notEmpty().withMessage("Phone number cannot be empty")
                .isMobilePhone().withMessage("Invalid phone number")
                .run(req)
            await body('password')
                .notEmpty().withMessage("Password cannot be empty")
                .isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols:1 }).withMessage("Password is not strong enough")
                .run(req)
            await body("confirmPassword")
                .notEmpty().withMessage("Please confirm your password")
                .equals(req.body.password).withMessage("Password did not match")
                .run(req)

            const validation = validationResult(req)

            if (validation.isEmpty()) {
                next()
            } else {
                return res.status(400).send({
                    status: false,
                    message: "Validation invalid",
                    error: validation.array()
                })
            }
        } catch (err) {
            res.status(400).send(err)
        }
    },
    checkLogin: async (req, res, next) => {
        try {
            await body('username')
                .optional({nullable: true})
                .run(req)
            await body('email')
                .isEmail().withMessage("Email invalid")
                .optional({nullable: true})
                .run(req)
            await body('phone')
                .isMobilePhone().withMessage("Invalid phone number")
                .optional({nullable: true})
                .run(req)
            await body('password')
                .notEmpty().withMessage("Please fill your password")
                .run(req)

            const validation = validationResult(req)

            console.log(validation);

            if (validation.isEmpty()) {
                next()
            } else {
                return res.status(400).send({
                    status: false,
                    message: "Validation invalid",
                    error: validation.array()
                })
            }
        } catch (err) {
            res.status(400).send(err)
        }
    },
    checkForgotPass: async (req, res, next) => {
        try {
            await body('email')
                .isEmail().withMessage("Invalid email")
                .notEmpty().withMessage("Please fill your email")
                .run(req)

        const validation = validationResult(req)

        if (validation.isEmpty()) next()
        else {
            res.status(400).send({
                message: "Invalid input",
                error: validation.array()
            })
        }
        } catch (err) {
            res.status(400).send(err)
        }
    },
    checkResetPass: async (req, res, next) => {
        try {
            await body('password')
                .notEmpty().withMessage("Please fill your new password")
                .isStrongPassword({
                    minLength: 6,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols:1
                }).withMessage("Password is not strong enough")
                .run(req)
            await body("confirmPassword")
                .notEmpty().withMessage("Please confirm your password")
                .equals(req.body.password).withMessage("Password did not match")
                .run(req)

            
            const validation = validationResult(req)

            if (validation.isEmpty()) next()
            else {
                res.status(400).send({
                    message: "Invalid input",
                    error: validation.array()
                })
            }
        } 
        catch (err) {
            res.status(400).send(err)
        }
    },
    checkChangePass: async (req, res, next) => {
        try {
            await body('currentPassword')
                .notEmpty().withMessage('Please fill your current password')
                .run(req)
            await body('password')
                .notEmpty().withMessage("Please fill your new password")
                .isStrongPassword({
                    minLength: 6,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols:1
                }).withMessage("Password is not strong enough")
                .run(req)
            await body("confirmPassword")
                .notEmpty().withMessage("Please confirm your password")
                .equals(req.body.password).withMessage("Password did not match")
                .run(req)

            
            const validation = validationResult(req)

            if (validation.isEmpty()) next()
            else {
                res.status(400).send({
                    message: "Invalid input",
                    error: validation.array()
                })
            }
        } catch (err) {
            res.status(400).send(err)
        }
    },
    checkChangeUsername: async (req, res, next) => {
        try {
            await body('currentUsername')
                .notEmpty().withMessage("Please fill your current username")
                .run(req)
            await body('username')
                .notEmpty().withMessage("Please fill your new username")
                .run(req)

            const validation = validationResult(req)

            if (validation.isEmpty()) next()
            else {
                res.status(400).send({
                    message: "Invalid input",
                    error: validation.array()
                })
            }            
        } catch (err) {
            res.status(400).send(err)
        }
    },
    checkChangePhone: async (req, res, next) => {
        try {
            await body('currentPhone')
                .isMobilePhone().withMessage("Invalid phone number")
                .notEmpty().withMessage("Please fill your current phone number")
                .run(req)
            await body('phone')
                .isMobilePhone().withMessage("Invalid phone number")
                .notEmpty().withMessage("Please fill your new phone number")
                .run(req)

            const validation = validationResult(req)

            if (validation.isEmpty()) next()
            else {
                res.status(400).send({
                    message: "Invalid input",
                    error: validation.array()
                })
            } 
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    },
    checkChangeEmail: async (req, res, next) => {
        try {
            await body('currentEmail')
                .isEmail().withMessage("Invalid email")
                .notEmpty().withMessage("Please fill your current email")
                .run(req)
            await body('email')
                .isEmail().withMessage("Invalid email")
                .notEmpty().withMessage("Please fill your new email")
                .run(req)

        const validation = validationResult(req)

        if (validation.isEmpty()) next()
        else {
            res.status(400).send({
                message: "Invalid input",
                error: validation.array()
            })
        }
        } catch (err) {
            res.status(400).send(err)
        }
    },
    checkCreateBlog: async (req, res, next) => {
        try {
            await body('title')
                .trim()
                .notEmpty().withMessage("Please enter your title")
                .run(req)
            await body('content')
                .trim()
                .notEmpty().withMessage("Please enter your content")
                .run(req)
            await body('videoURL')
                .optional()
                .trim().run(req)
            await body('country')
                .trim()
                .notEmpty().withMessage("Please enter your title")
                .run(req)
            await body('keywords')
                .trim()
                .notEmpty().withMessage("Please enter your keyword")
                .run(req)
            await body('category')
                .trim()
                .isNumeric().withMessage("Please enter category id")
                .notEmpty().withMessage("Please enter your category")
                .run(req)
            
            const validation = validationResult(req)
            
            if (req.file === undefined) {
                res.status(400).send({
                    status: false,
                    message: "Validation invalid",
                    error: "File cannot be empty"
                })
            } else {
                if (validation.isEmpty()) {
                    next()
                }
                else {
                    const {filename, destination} = req.file
                    fs.unlinkSync(`${destination}/${filename}`)

                    res.status(400).send({
                        status: false,
                        message: "Validation invalid",
                        error: validation.array()
                    })
                }
            }
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    }
}