const express = require('express')
const cors = require('cors')
const path = require('path')

const whitelist = ['http://example1.com', 'http://example2.com']

const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}

const app = express()
const bodyParser = require('body-parser')
const logger = require('morgan')
const pkginfo = require('@ma.vu/pkginfo')

app.use(cors())

app.use(bodyParser.json())
app.use(logger('combined'))
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)

// app.get('*', (req, res) => res.send('.'))

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')))

app.get('/info/:name', async (req, res) => {
  const options = [
    'homepage',
    'repository',
    'latest',
    'name',
    'description',
    'version',
    'author',
    'license',
    'devDependencies',
    'dependencies',
  ]
  const name = req.params.name
  const result = await pkginfo(name, options)
  res.json(result)
})

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})

module.exports = app
