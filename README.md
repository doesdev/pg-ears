# pg-ears [![NPM version](https://badge.fury.io/js/pg-ears.svg)](https://npmjs.org/package/pg-ears)   [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)   [![Dependency Status](https://dependencyci.com/github/doesdev/pg-ears/badge)](https://dependencyci.com/github/doesdev/pg-ears)

> Resilient Postgres listen client

# Recommend using [pg-listen](https://github.com/andywer/pg-listen)

This project is not in any production use by the author. There has also been
very little community engagement on the module that would motivate the
extensive time investment to make this module as good as `pg-listen`. Given
that module has more usage and is actively maintained I would strongly
recommend using that instead.

## Known Issues

- [LISTEN leaks](https://github.com/doesdev/pg-ears/issues/6):
Upon disconnect and reconnect `LISTEN` statements accumulate

## Install

```sh
$ npm install --save pg-ears
```

## API

pg-ears exports a single function takes the same options as a new
`node-postgres` `new Client(opts)` with a couple additions and returns an object
containing the methods `listen` and `notify`

- **options** *(Object - required)* Options for [node-postgres](https://github.com/brianc/node-postgres) connection plus the
following:
  - **checkInterval** *(Number (ms) - optional - default: 30000 [30 sec.])*
  - **maxAttempts** *(Number - optional - default: 60)* Multiplier of
  checkInterval - number of attempts before giving up on reconnect

`listen(channel, callback)`
- **channel** *(String - required)*
- **callback** *(Function - required)* will be called every time a message is
received with `(error, data)` as arguments OR with an error when the PG client
encounters an error

`notify(channel, payload, callback)`
- **channel** *(Object - required)*
- **payload** *(Object | Array | String - required)*
- **callback** *(Object - optional)* will be called with error if unable to send
OR when an error occurs on the PG client

## Usage

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

## Use safe identifiers as channel names

:warning: Channel names in postgresql are `identifiers`, just like the name of a
table or a column.
Please refer to the offical postgresql documentation about valid [identifiers](https://www.postgresql.org/docs/current/static/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS).

node-postgres does not currently allows channel names to be parameterized to
avoid sql-injection attacks.

See node-postgres [issue #1258](https://github.com/brianc/node-postgres/issues/1258)
for details.

**pg-ears performs no validation or sanitation on the channel names and they are
inserted into the sql queries as-is.**

On the other hand, payloads of your notifications are json encoded and decoded
automatically by pg-ears and passed using safe parameterized queries.


## License

MIT © [Andrew Carpenter](https://github.com/doesdev)
