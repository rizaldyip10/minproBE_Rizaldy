const { blogController } = require('../controllers')
const { verifyToken } = require('../middlewares/auth')
const { multerUpload } = require('../middlewares/multer')
const { checkCreateBlog } = require('../middlewares/validation')

const router = require('express').Router()

router.get('/', blogController.getAllBlog)
router.post('/createblog', verifyToken, multerUpload('./Public/Blog', 'Blog').single('file'), checkCreateBlog, blogController.createBlog)
router.post('/likeblog', verifyToken, blogController.likeBlog)
router.get('/paglike', verifyToken, blogController.getLikedBlog)
router.get('/paguser', verifyToken, blogController.getUserBlog)
router.patch('/deleteblog', verifyToken, blogController.deleteBlog)
router.get('/getcategory', blogController.getCategory)
router.get('/:blogId', blogController.getBlogById)

module.exports = router