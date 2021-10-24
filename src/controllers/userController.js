const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const ApiError = require('../error/ApiError')
const {User} = require('../models/models')
const {Op} = require('sequelize')


const generateJwt = (id, username, name, surname, patronymic, leaderId) => {
  const shortName = `${surname} ${name[0]}. ${patronymic[0]}.`
  return jwt.sign({id, username, shortName, leaderId}, process.env.SECRET_KEY, {expiresIn: '24h'})
}

const getUser = (req) => {
  const token = req.headers.authorization.split(' ')[1]
  return jwt.verify(token, process.env.SECRET_KEY)
}


class UserController {

  async registration(req, res, next) {
    const {surname, name, patronymic, username, password} = req.body

    if (!username.trim() || !password.trim()) {
      return next(ApiError.badRequest('Неверный логин или пароль'))
    }

    const candidate = await User.findOne({where: {username}})

    if (candidate) {
      return next(ApiError.badRequest('Пользователь уже существует'))
    }

    const hashPassword = await bcrypt.hash(password, 5)
    const user = await User.create({name, surname, patronymic, username, password: hashPassword})
    const token = generateJwt(user.id, user.username, user.name, user.surname, user.patronymic)

    return res.json({token})
  }

  async login(req, res, next) {
    const {username, password} = req.body

    const user = await User.findOne({where: {username}})

    if (!user) {
      return next(ApiError.internal('Пользователя с таким логином не существует'))
    }

    const comparePassword = bcrypt.compareSync(password, user.password)

    if (!comparePassword) {
      return next(ApiError.internal('Введён неверный пароль'))
    }

    const token = generateJwt(user.id, user.username, user.name, user.surname, user.patronymic, user.leaderId)

    return res.json({token})
  }

  async check(req, res, next) {

    const user = await User.findOne({where: {username: req.user.username}})

    if (user) {
      const token = generateJwt(user.id, user.username, user.name, user.surname, user.patronymic, user.leaderId)
      return res.json({token})
    }

    return next(ApiError.internal('Пользователь не существует или был заблокирован'))
  }

  async getWorkers(req, res, next) {
    const user = getUser(req)
    const candidate = await User.findOne({where: {username: user.username}})

    if (!candidate) {
      return next(ApiError.badRequest('Access denied'))
    }

    const {count, rows: workers} = await User.findAndCountAll({
      where: {
        [Op.or]: [
          {leaderId: user.id},
          {id: user.id}
        ]
      },
      attributes: ['id', 'name', 'surname', 'patronymic', 'leaderId'],
      order: [['surname', 'ASC']]
    })
    return res.json({count, workers})
  }

}


module.exports = new UserController()