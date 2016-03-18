'use strict'

const chai = require('chai')
const bunyan = require('bunyan')
const express = require('express')
const supertest = require('supertest-as-promised')
const crummy = require('../express')

const expect = chai.expect

function createApp(mw, options) {
  const app = express()
  app.use(crummy(options))
  app.use((req, res, next) => {
    try {
      mw(req, res, next)
    } catch (err) {
      return next(err)
    }
    return null
  })
  app.use((err, req, res, next) => {
    res.status(500).send(err.message)
    next()
  })
  return supertest(app)
}

describe('express', () => {

  it('fails if logger isn\'t passed', () => {
    expect(() => createApp()).to.throw(/logger is required/)
    expect(() => createApp(() => null, {
      logger: bunyan.createLogger({ name: 'foo' })
    })).to.not.throw()
  })

  it('fails if logger doesn\'t have child function', () => {
    expect(() => createApp(() => null, {
      logger: {}
    })).to.throw(/logger must have a child method/)
  })

  it('adds logger to request', () => {
    const request = createApp((req, res) => {
      if (req.log) return res.send('success')
      return res.send('failure')
    }, {
      logger: bunyan.createLogger({ name: 'foo' })
    })
    return request.get('/').expect('success')
  })

  it('allows customization to where it gets saved to', () => {
    const request = createApp((req, res) => {
      if (req.logger) return res.send('success')
      return res.send('failure')
    }, {
      logger: bunyan.createLogger({ name: 'foo' }),
      path: 'logger'
    })
    return request.get('/').expect('success')
  })

  it('allows you to add custom meta data based on request', () => {
    const logSpy = chai.spy((data) => {
      expect(data.id).to.be.equal('foo')
    })
    const request = createApp((req, res, next) => {
      req.log.info('foo')
      res.send('success')
      next()
    }, {
      logger: bunyan.createLogger({
        name: 'foo',
        streams: [{
          type: 'raw',
          stream: { write: logSpy }
        }]
      }),
      meta: () => ({
        id: 'foo'
      })
    })

    return request.get('/').expect('success')
  })

})
