const { authController } = require('../controllers')
const { verifyToken } = require('../middlewares/auth')
const { checkRegister, checkLogin, checkEmail, checkPassword, checkForgotPass, checkResetPass } = require('../middlewares/validation')

const router = require('express').Router()

router.post('/register',checkRegister, authController.register)
router.post('/login', checkLogin, authController.login)
router.patch('/verify', verifyToken, authController.verify)
router.get('/keeplogin', verifyToken, authController.keepLogin)
router.put('/forgetpassword', checkForgotPass, authController.forgetPassword)
router.patch('/resetpassword', verifyToken, checkResetPass, authController.resetPassword)

module.exports = router