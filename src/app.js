import http from 'http'
import express from 'express'
import path from 'path'
import logger from 'morgan'
import bodyParser from 'body-parser'
import cors from 'cors'
// Import routes
import routes from './routes'

// Create http server with Express and Socket.io
const app = express()
const server = http.Server(app)

const { PORT = 8080, IP = 'localhost' } = process.env
server.listen(PORT, IP, () => console.log(`Server started on port ${PORT}`)) // eslint-disable-line no-console


app.disable('x-powered-by')

// View engine setup - DONT NEED NOW
// app.set('views', path.join(__dirname, '../views'));
// app.set('view engine', 'pug');

app.set('ipaddr', IP )
app.set('port', PORT )
app.use(logger('dev', {
  skip: () => app.get('env') === 'test'
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, '../public')))
app.use(cors({ origin: true }) )
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Headers', 'Origin, Content-Type')
//   res.header('Access-Control-Allow-Credentials', 'true')
//   next()
// })
// Routes
app.use('/', routes)
// app.use('/chat', chat)

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

/* eslint-disable no-console */
/* eslint-enable no-console */

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  res
    .status(err.status || 500)
    .json({
      error: true,
      message: err.message
    })
})

export default app
