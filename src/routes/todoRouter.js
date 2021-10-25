const Router = require('express')
const router = new Router()
const todoController = require('../controllers/todoController')
const authMiddleware = require('../middleware/authMiddleware')


router.post('/create', authMiddleware, todoController.createTodo)
router.post('/get', authMiddleware, todoController.getTodo)
router.put('/update', authMiddleware, todoController.updateTodo)
router.post('/delete', authMiddleware, todoController.deleteTodo)


module.exports = router