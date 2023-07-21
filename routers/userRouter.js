const { userController } = require('../controllers')
const { verifyToken } = require('../middlewares/auth')
const { multerUpload } = require('../middlewares/multer')
const { checkChangePass, checkChangeUsername, checkChangePhone, checkChangeEmail } = require('../middlewares/validation')

const router = require('express').Router()

router.patch('/changepass', verifyToken, checkChangePass, userController.changePass)
router.patch('/changeusername', verifyToken, checkChangeUsername, userController.changeUsername)
router.patch('/changephone', verifyToken, checkChangePhone, userController.changePhone)
router.patch('/changeemail', verifyToken, checkChangeEmail, userController.changeEmail)
router.patch('/changepic', verifyToken, multerUpload('./Public/Avatar', "Avatar").single('file'), userController.changePic)


module.exports = router