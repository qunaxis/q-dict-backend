import http from 'http'
import express from 'express'
import path from 'path'
import logger from 'morgan'
import bodyParser from 'body-parser'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import expressSession from 'express-session'

import mongoose from 'mongoose'
import User from './models/User'

import passport from 'passport'
const VKontakteStrategy = require('passport-vkontakte').Strategy

// Import routes
import routes from './routes'

// Create http server with Express and Socket.io
const app = express()
const server = http.Server(app)

const { PORT = 8080, IP = 'localhost' } = process.env
server.listen(PORT, IP, () => console.log(`Server started on port ${PORT}`)) // eslint-disable-line no-console

const { MONGO_USER, MONGO_PASSWORD, MONGO_POSTFIX } = process.env
mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_POSTFIX}`, { useMongoClient: true }, (err) => {
  err ? console.error(err) : console.log('MongoDB connected')
})
mongoose.Promise = global.Promise

app.disable('x-powered-by')

// View engine setup - DONT NEED NOW
// app.set('views', path.join(__dirname, '../views'));
// app.set('view engine', 'pug');

app.set('ipaddr', IP )
app.set('port', PORT )
app.use(logger('dev', {
  skip: () => app.get('env') === 'test'
}))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressSession({ secret:'keyboard cat', resave: true, saveUninitialized: true }))
app.use(cors({ origin: true }))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static(path.join(__dirname, '../public')))
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Headers', 'Origin, Content-Type')
//   res.header('Access-Control-Allow-Credentials', 'true')
//   next()
// })

const { VKONTAKTE_APP_ID, VKONTAKTE_APP_SECRET } = process.env

passport.use(new VKontakteStrategy(
  {
    clientID:     VKONTAKTE_APP_ID, // VK.com docs call it 'API ID', 'app_id', 'api_id', 'client_id' or 'apiId'
    clientSecret: VKONTAKTE_APP_SECRET,
    callbackURL:  "//q-dict-server.herokuapp.com/auth/vk/callback"
  },
  function myVerifyCallbackFn(accessToken, refreshToken, params, profile, done) {

    // Now that we have user's `profile` as seen by VK, we can
    // use it to find corresponding database records on our side.
    // Also we have user's `params` that contains email address (if set in 
    // scope), token lifetime, etc.
    // Here, we have a hypothetical `User` class which does what it says.
    User.findOrCreate({ vk_id: profile.id })
        .then(function (user) { done(null, user); })
        .catch(done);
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser((id, done) => {
  User.findById(id)
      .then(function (user) { done(null, user); })
      .catch(done)
})


app.get('/auth/vk', passport.authenticate('vkontakte'))
app.get('/auth/vk/callback',
  passport.authenticate('vkontakte', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
)
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
