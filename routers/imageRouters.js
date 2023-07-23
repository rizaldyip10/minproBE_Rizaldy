const { imageController } = require('../controllers')

const router = require('express').Router()

router.get('/blogimg/:filename', imageController.viewBlogImage)
router.get('/avatar/:filename', imageController.viewUserImage)

module.exports = router