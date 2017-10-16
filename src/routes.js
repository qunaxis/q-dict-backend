import { Router } from 'express'
import axios from 'axios'
import querystring from 'querystring'

const routes = Router()

/**
 * GET home page
 */

routes.post('/translate', (req, res, next) => {
  const url = {
    google: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t&dt=bd&dj=1&tl=ru&text=',
    yandex: 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup'
  }
  if (req.body.resource == 'google') {
    axios.get(url.google + req.body.data)
      .then(response => {
        // console.log(response)
        const translations = response.data.sentences[0].trans
        res.json({
          status: 'ok',
          word: {
            ru: translations ? [translations] : []
          }
        })
      })
      .catch(err => {
        res.json({
          status: 'error',
          error: err.toString()
        })
      })    
  }
  if (req.body.resource == 'yandex') {
    const cfg = {
      key: 'dict.1.1.20171001T225445Z.f9bd06348f3ba757.7335dd5e741ff8bbdea4684f7005ff28097a4fbc',
      lang: 'en-ru',
      text: req.body.data
    }
    axios.post(url.yandex, querystring.stringify(cfg))
      .then(response => {
        let translations, transcription
        if (req.body.data == '') {
          translations = [],
          transcription = '' 
        } else {
          translations = response.data.def[0].tr.map(trans => trans.text)
          transcription = response.data.def[0].ts
        }

        res.json({
          status: 'ok',
          word: {
            en: req.body.data,
            ru: translations,
            transcription: transcription
          }
        })
      })
      .catch(err => {
        console.error(err)
        res.json({
          status: 'error',
          error: err.toString()
        })
      })    
  }
  // if (!req.body.resource || req.body.resource !== 'google' || req.body.resource !== 'yandex') {
  //   res.json({
  //     status: 'error',
  //     error: 'Choose resource' 
  //   })
  // }
})

/**
 * GET /list
 *
 * This is a sample route demonstrating
 * a simple approach to error handling and testing
 * the global error handler. You most certainly want to
 * create different/better error handlers depending on
 * your use case.
 */
routes.get('/list', (req, res, next) => {
  const { title } = req.query

  if (title == null || title === '') {
    // You probably want to set the response HTTP status to 400 Bad Request
    // or 422 Unprocessable Entity instead of the default 500 of
    // the global error handler (e.g check out https://github.com/kbariotis/throw.js).
    // This is just for demo purposes.
    next(new Error('The "title" parameter is required'))
    return
  }

  res.send('/list route')
})

export default routes
