var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const axios = require('axios')
const logger = require('morgan')

app.use(bodyParser.json())
app.use(logger('combined'))
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)

app.get('*', (req, res) => res.send('.'))

app.post('/info', async function(req, res) {
  res.send('success')
})

module.exports = app
