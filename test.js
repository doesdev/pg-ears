'use strict'

import test from 'ava'
import pgEars from './index'
const pgOptions = require('./../_secrets/pg-ears/config.json')
const { listen, notify } = pgEars(pgOptions)
const channel = 'my_test_channel'
const msg = 'heydair'

test.cb('it listens and notifies', (assert) => {
  let gotIt = (err, pl) => {
    if (err) throw err
    assert.is(pl, msg)
    assert.end()
  }
  listen(channel, gotIt)
  setTimeout(() => notify(channel, msg, console.error), 2000)
})
