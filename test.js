'use strict'

const test = require('mvt')
const pgEars = require('./index')
const pgOptions = require('./../_secrets/pg-ears/config.json')
const { listen, notify } = pgEars(pgOptions)
const channel = 'my_test_channel'
const msg = 'heydair'

test('it listens and notifies', async (assert) => {
  let val

  await new Promise((resolve, reject) => {
    let gotIt = (err, pl) => {
      if (err) reject(err)
      val = pl
      resolve()
    }
    listen(channel, gotIt)
    setTimeout(() => notify(channel, msg, console.error), 2000)
  })

  assert.is(msg, val)
})
