'use strict'

// non priority modules...
const config = require('./config')
const express = require('express')
const piping = require('piping')
const path = require('path')

const sqlService = require('./services/data-access/sql.service')
const app = express()

piping()
/**
 * Sleep in ms
 * @param ms - milliseconds
 * @return {Promise}
 */
function sleep (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

// Initialise the Database Connection pool
;(async function () {
  try {
    await sqlService.initPool()
  } catch (error) {
    // The initial probe connection was not able to connect: the DB is not available.  This will cause all
    // connections in the connection pool to be initialised to closed. By pausing, we allow time for the
    // db to become available.  When run in a docker container the PM2 process manager will restart the process, and
    // hopefully the DB will be up by then.
    await sqlService.drainPool()
    await sleep(config.WaitTimeBeforeExitInSeconds * 1000)
    process.exit(1)
  }
})()

/**
 * Load feature toggles
 */
const school = require('./routes/school')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// app.use(partials())

// Serve static files
// Set up *before* the session is set-up, or each of these
// causes a session read and write.

app.use('/', school)

app.use('/assets', express.static(path.join(__dirname, '/node_modules/govuk-frontend/assets')))

module.exports = app
