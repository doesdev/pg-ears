'use strict'

// setup
const Pg = require('pg').Client
const maxAttempts = 60
const attempts = {}

// export
module.exports = (opts) => {
  let listen = (channel, cb) => {
    let client = new Pg(opts)
    client.connect((err) => {
      if (err) return cb(err)
      client.connection.stream.setKeepAlive(true)
      client.query(`LISTEN ${channel};`, (e) => {
        if (e) return cb(e)
      })
      client.on('error', cb)
      client.on('notification', (d) => {
        if (d.toString() !== 'pg-ears-test') return cb(null, d)
        attempts[channel] = 0
      })
      setInterval(
        (() => {
          let testClient = new Pg(opts)
          let handleErr = (e) => {
            attempts[channel] = attempts[channel] || 0
            attempts[channel] += 1
            if (client && client.end) client.end()
            if (testClient && testClient.end) testClient.end()
            if (attempts[channel] > maxAttempts) return cb(err)
            return listen(channel, cb)
          }
          testClient.connect((err) => {
            if (err) return handleErr(err)
            testClient.query(`NOTIFY ${channel}, 'pg-ears-test';`, (err) => {
              if (err) return handleErr(err)
              if (testClient && testClient.end) testClient.end()
            })
          })
        })(),
        30000
      )
    })
  }
  let notify = (channel, payload, cb) => {
    let client = new Pg(opts)
    payload = JSON.stringify(payload)
    client.connect((err) => {
      if (err) return cb(err)
      client.query(`NOTIFY ${channel}, '${payload}';`, (e) => {
        if (e) return cb(e)
        if (client && client.end) client.end()
      })
    })
  }
  return {listen, notify}
}
