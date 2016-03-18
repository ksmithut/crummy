'use strict'

module.exports = function crummy(options) {
  options = Object.assign({
    path: 'log',
    logger: null,
    meta: () => null
  }, options)

  const logger = options.logger

  if (!logger) throw new Error('crummy: logger is required')
  if (typeof logger.child !== 'function') {
    throw new Error('crummy: logger must have a child method')
  }

  return {
    path: options.path,
    meta: options.meta,
    logger: (meta) => logger.child(meta)
  }
}
