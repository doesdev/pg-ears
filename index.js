'use strict'

// setup
const { Client } = require('pg')
const attempts = {}
const lastMsg = {}
let maxAttempts = 60
let checkInterval = 30000

// export
module.exports = (opts) => {
  maxAttempts = opts.maxAttempts || maxAttempts
  checkInterval = opts.checkInterval || checkInterval
  let listen = (channel, cb) => {
    let testClient
    lastMsg[channel] = Date.now()
    let client = new Client(opts)
    let retry = (err) => {
      attempts[channel] = attempts[channel] || 0
      attempts[channel] += 1
      if (client && client.end) client.end()
      if (testClient && testClient.end) testClient.end()
      if (attempts[channel] < maxAttempts) return listen(channel, cb)
      delete attempts[channel]
      let newErr = new Error(`too many failed attempts for ${channel}`)
      newErr.stack = err.stack || newErr.stack
      return cb(newErr)
    }
    client.connect((err) => {
      if (err) return setTimeout((err) => retry(err), checkInterval)
      client.connection.stream.setKeepAlive(true)
      client.query(`LISTEN ${channel};`, (err) => {
        if (err) return setTimeout((err) => retry(err), checkInterval)
      })
      client.on('notification', (d) => {
        attempts[channel] = 0
        lastMsg[channel] = Date.now()
        if (d.payload !== 'pg-ears-test') return cb(null, d.payload)
      })
      let checkConnection = () => {
        testClient = new Client(opts)
        testClient.connect((err) => {
          if (err) return setTimeout((err) => retry(err), checkInterval)
          testClient.query('SELECT pg_notify($1, $2)', [channel, 'pg-ears-test'], (err) => {
            if (err) return setTimeout((err) => retry(err), checkInterval)
            if (testClient && testClient.end) testClient.end()
            setTimeout(checkConnection, checkInterval)
          })
        })
      }
      let checkLastMsg = () => {
        if (Date.now() - lastMsg[channel] > (checkInterval * 1.5)) {
          if (client && client.end) client.end()
          if (testClient && testClient.end) testClient.end()
          delete attempts[channel]
          return listen(channel, cb)
        }
        setTimeout(checkLastMsg, checkInterval)
      }
      setTimeout(checkConnection, checkInterval)
      setTimeout(checkLastMsg, checkInterval * 1.5)
    })
  }
  let notify = (channel, payload, cb) => {
    let client = new Client(opts)
    let hasCb = typeof cb === 'function'
    if (typeof payload !== 'string') payload = JSON.stringify(payload)
    client.connect((err) => {
      if (err && hasCb) return cb(err)
      client.query('SELECT pg_notify($1, $2)', [channel, payload], (e) => {
        if (e && hasCb) return cb(e)
        if (client && client.end) client.end()
      })
    })
  }
  return {listen, notify}
}
