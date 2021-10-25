require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const models = require('./src/models/models')
const cors = require('cors')
const router = require('./src/routes/index')
const errorHandler = require('./src/middleware/ErrorHandlingMiddleware')
const path = require('path')

const PORT = process.env.PORT || 5001

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', router)

if (process.env.NODE_ENV === 'production') {
   app.use(express.static(path.join(__dirname, 'build')))
   app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'build/index.html'))
   })
}

app.use(errorHandler)

const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
    app.listen(PORT, () => console.log(`Server has been started on port ${PORT}`))
  } catch (e) {
    console.log(e)
  }
}

start()