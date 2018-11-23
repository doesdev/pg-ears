'use strict'

// setup
const { Client } = require('pg')
const attempts = {}
const lastMsg = {}
const maxAttemptsDefault = 60
const checkIntervalDefault = 30000
const notifyQ = `SELECT pg_notify($1, $2)`

// export
module.exports = (opts) => {
  const maxAttempts = opts.maxAttempts || maxAttemptsDefault
  const checkInterval = opts.checkInterval || checkIntervalDefault

  const listen = (channel, cb) => {
    let testClient
    lastMsg[channel] = Date.now()
    const client = new Client(opts)

    const retry = (err) => {
      attempts[channel] = attempts[channel] || 0
      attempts[channel] += 1

      if (client && client.end) client.end()
      if (testClient && testClient.end) testClient.end()
      if (attempts[channel] < maxAttempts) return listen(channel, cb)

      delete attempts[channel]
      let newErr = new Error(`Too many failed attempts for ${channel}`)
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

      const checkConnection = () => {
        testClient = new Client(opts)
        testClient.connect((err) => {
          if (err) return setTimeout((err) => retry(err), checkInterval)

          const reCheckOnError = (err) => {
            if (err) return setTimeout((err) => retry(err), checkInterval)
            if (testClient && testClient.end) testClient.end()
            setTimeout(checkConnection, checkInterval)
          }

          testClient.query(notifyQ, [channel, 'pg-ears-test'], reCheckOnError)
        })
      }

      const checkLastMsg = () => {
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
    const client = new Client(opts)
    const hasCb = typeof cb === 'function'
    if (typeof payload !== 'string') payload = JSON.stringify(payload)

    client.connect((err) => {
      if (err && hasCb) return cb(err)

      client.query(notifyQ, [channel, payload], (e) => {
        if (e && hasCb) return cb(e)
        if (client && client.end) client.end()
      })
    })
  }

  return { listen, notify }
}
