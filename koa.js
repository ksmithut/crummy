'use strict'

const crummy = require('./index')

module.exports = function koaCrummy(options) {
  options = crummy(options)

  return function *(next) {
    this[options.path] = options.logger(options.meta(this.req, this.res))
    yield next
  }
}
