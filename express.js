'use strict'

const crummy = require('./index')

module.exports = function expressCrummy(options) {
  options = crummy(options)

  return (req, res, next) => {
    req[options.path] = options.logger(options.meta(req, res))
    next()
  }
}
