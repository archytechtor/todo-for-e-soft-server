const jwt = require('jsonwebtoken')
const ApiError = require('../error/ApiError')
const {User, Todo} = require('../models/models')
const {Op} = require('sequelize')


const getUser = (req) => {
  const token = req.headers.authorization.split(' ')[1]
  return jwt.verify(token, process.env.SECRET_KEY)
}


class TodoController {

  async createTodo(req, res, next) {
    const {title, description, priority, status, sla, assignee} = req.body
    const user = getUser(req)
    const candidate = await User.findOne({where: {username: user.username}})

    if (!candidate) {
      return next(ApiError.badRequest('В доступе отказано'))
    }

    try {
      await Todo.create({
        title,
        description,
        priority,
        status,
        sla,
        creatorId: user.id,
        assigneeId: assignee
      })
      return res.json({success: 'Задача успешно создана'})
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async getTodo(req, res, next) {
    const {pageSize, page, sorter, filter} = req.body
    const user = getUser(req)
    const candidate = await User.findOne({where: {username: user.username}})

    if (!candidate) {
      return next(ApiError.badRequest('В доступе отказано'))
    }

    try {
      const {priority, status, assignee, sla} = filter
      const workers = await User.findAll({where: {leaderId: user.id}})
      const searchByDate = {
        today: {
          [Op.gt]: new Date().setHours(0, 0, 0, 0),
          [Op.lt]: new Date().setHours(23, 59, 59, 1000)
        },
        week: {
          [Op.gt]: new Date().setHours(0, 0, 0, 0),
          [Op.lt]: new Date(new Date().setHours(23, 59, 59, 1000) + 24 * 60 * 60 * 7 * 1000)
        },
        actual: {[Op.gt]: new Date()},
        expired: {[Op.lt]: new Date()}
      }

      const {count, rows: todo} = await Todo.findAndCountAll({
        where: assignee.length > 0
          ? {
            assigneeId: {[Op.or]: [...assignee.map(id => id === 'null' ? null : Number(id))]},
            [Op.and]: [
              {priority: {[Op.or]: [...priority.map(value => value)]}},
              {status: {[Op.or]: [...status.map(value => value)]}},
              sla.length && {sla: searchByDate[sla]}
            ]
          }
          : {
            [Op.or]: [
              {assigneeId: {[Op.or]: [user.id, ...workers.map(user => user.id)]}},
              // чтобы лидеры видели кейсы подчинённых своих подчинённых
              {creatorId: user.id} // закоментить это
              // {creatorId: {[Op.or]: [user.id, ...workers.map(user => user.id)]}} // и раскоментить это
            ],
            [Op.and]: [
              {priority: {[Op.or]: [...priority.map(value => value)]}},
              {status: {[Op.or]: [...status.map(value => value)]}},
              sla.length && {sla: searchByDate[sla]}
            ]
          },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'surname', 'patronymic', 'leaderId']
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'name', 'surname', 'patronymic', 'leaderId'],
          }
        ],
        order: sorter[0] === 'assignee' ? [[{model: User, as: 'assignee'}, 'surname', sorter[1]]] : [sorter],
        limit: pageSize,
        offset: pageSize * page - pageSize
      })

      return res.json({count, todo})
    } catch (e) {
      return res.status(500).json({error: e.message})
    }

  }

  async updateTodo(req, res, next) {
    const {id, title, description, priority, status, sla, assignee} = req.body
    const user = getUser(req)
    const candidate = await User.findOne({where: {username: user.username}})

    if (!candidate) {
      return next(ApiError.badRequest('В доступе отказано'))
    }

    try {
      const task = Todo.findOne({where: {id: id}})

      if (!task) {
        return res.json({error: 'Задача не найдена'})
      }

      await Todo.update({
        title,
        description,
        priority,
        status,
        sla,
        assigneeId: assignee
      }, {
        where: {id: id}
      })

      return res.json({success: 'Задача успешно обновлена'})
    } catch (e) {
      return res.status(500).json({error: e.message})
    }

  }

  async deleteTodo(req, res, next) {
    const {id} = req.body
    const user = getUser(req)
    const candidate = await User.findOne({where: {username: user.username}})

    if (!candidate) {
      return next(ApiError.badRequest('В доступе отказано'))
    }

    try {
      const task = Todo.findOne({where: {id: id}})

      if (!task) {
        return res.json({error: 'Задача не найдена'})
      }

      await Todo.destroy({where: {id: id, [Op.and]: [{creatorId: user.id}]}})

      return res.json({success: 'Задача успешно удалена'})
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

}

module.exports = new TodoController()