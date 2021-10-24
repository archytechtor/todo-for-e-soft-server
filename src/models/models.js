const sequelize = require('../../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  patronymic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

const Todo = sequelize.define('todo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  priority: {
    type: DataTypes.INTEGER // 2 - высокий, 1 - средний, 0 - низкий
  },
  status: {
    type: DataTypes.STRING // к выполнению, выполняется, выполнена, отменена
  },
  sla: {
    type: DataTypes.DATE,
    allowNull: true
  }
})


User.hasMany(Todo)
User.belongsTo(User, {as: 'leader'})
Todo.belongsTo(User, {as: 'creator'})
Todo.belongsTo(User, {as: 'assignee'})


module.exports = {
  User,
  Todo
}