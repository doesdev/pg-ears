# pg-ears [![NPM version](https://badge.fury.io/js/pg-ears.svg)](https://npmjs.org/package/pg-ears)   [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

> Resilient Postgres listen client

## install

```sh
$ npm install --save pg-ears
```

## api

pg-ears exports a single function takes the same options as a new `node-postgres` `Client` and returns an object containing the methods `listen` and `notify`

- **options** *(Object - required)* Options for [node-postgres](https://github.com/brianc/node-postgres) connection

`listen(channel, callback)`
- **channel** *(String - required)*
- **callback** *(Function - required)* will be called every time a message is received with `(error, data)` as arguments

`notify(channel, payload, callback)`
- **channel** *(Object - required)*
- **payload** *(Object | Array | String - required)*
- **callback** *(Object - optional)* will be called with error if unable to send

## usage

```js
const options = {
  user: 'foo', //env var: PGUSER
  database: 'my_db', //env var: PGDATABASE
  password: 'secret', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432 //env var: PGPORT
}
const pgEars = require('pg-ears')(options)
pgEars.listen('mychannel', (err, data) => {
  if (err) return console.error(err)
  console.log(data)
})
pgEars.notify('mychannel', {key: 'value'}, (err) => {
  if (err) console.error(err)
})
```

## license

MIT © [Andrew Carpenter](https://github.com/doesdev)
