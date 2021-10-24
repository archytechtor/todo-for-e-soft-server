const Router = require('express')
const router = new Router()
const todoController = require('../controllers/todoController')


router.post('/create', todoController.createTodo)
router.post('/get', todoController.getTodo)
router.put('/update', todoController.updateTodo)
router.post('/delete', todoController.deleteTodo)


module.exports = router