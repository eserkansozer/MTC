'use strict'

const { performance } = require('perf_hooks')
const functionName = 'gias-school-sync'

module.exports = async function (context, myTimer) {
  const start = performance.now()

  try {
    // TODO run sync
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} complete, run took ${durationInMilliseconds} ms`)
}
