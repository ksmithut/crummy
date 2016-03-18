# `crummy`

> **Crummy**
>
> A logger's bus. Also an adjective meaning "no good" or "undesirable"
>
> \- [http://pacificforestfoundation.org/glossary.html][logger-terms]

`crummy` is middleware to simply attach a [bunyan][bunyan] logger to the request
context of your http server of choice. Below is a list of supported http server
modules:

* [`express`](http://expressjs.com/)
* [`koa`](http://koajs.com/)

If you don't see yours above, feel free to request it in the issues section of
this repository, or use the adapter module to adapt it to your own.

The reason `bunyan` is required is because it is the one popular logging module
that I could find that made it really easy to make a copy of a logger with all
of the different logging transports that the original had. If winston or other
loggers support this, I would be willing to support multiple logging modules.

# Usage with `express`

```js
const express = require('express')
const crummy = require('crummy/express')
const uuid = require('uuid')
const log = require('./lib/log')

const app = express()

app.use(crummy({
  path: 'log', // will attach to `req.log`
  logger: log, // The bunyan logger to use. `.child()` will be called on it
  meta: (req, res) => { // attaches returned object to metadata of each log in the request
    return {
      reqId: return uuid.v4()
    }
  }
}))
app.use((req, res, next) => {
  req.log.info(req.method, req.path); // Will log the path requested, as well as any default meta data
})

// ... routes, other middleware, app.listen(), etc.
```

# Usage with `koa`

```js
const koa = require('koa')
const crummy = require('crummy/koa')
const uuid = require('uuid')
const log = require('./lib/log')

const app = koa()

app.use(crummy({
  path: 'log', // will attach to `req.log`
  logger: log, // The bunyan logger to use. `.child()` will be called on it
  meta: (req, res) => { // attaches returned object to metadata of each log in the request
    return {
      reqId: return uuid.v4()
    }
  }
}))
app.use(function *(next) {
  this.log.info(req.method, req.path);
  let start = Date.now()
  yield next
  let responseTime = Date.now() - start
  this.log.info(`${responseTime}ms`)
})

// ... other koa setup stuff
```

[logger-terms]: http://pacificforestfoundation.org/glossary.html
[bunyan]: https://github.com/trentm/node-bunyan
