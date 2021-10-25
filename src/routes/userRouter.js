const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')


router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)

router.get('/workers', authMiddleware, userController.getWorkers)
router.post('/all', authMiddleware, userController.getAllUsers)
router.put('/update', authMiddleware, userController.updateUser)
router.post('/delete', authMiddleware, userController.deleteUser)


module.exports = router