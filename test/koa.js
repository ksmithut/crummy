'use strict'

const chai = require('chai')
const bunyan = require('bunyan')
const koa = require('koa')
const supertest = require('supertest-koa-agent')
const crummy = require('../koa')

const expect = chai.expect

function createApp(mw, options) {
  const app = koa()
  app.use(crummy(options))
  app.use(mw)
  return supertest(app)
}

describe('koa', () => {

  it('fails if logger isn\'t passed', () => {
    expect(() => createApp(function *() { yield null }))
      .to.throw(/logger is required/)
    expect(() => createApp(function *() { yield null }, {
      logger: bunyan.createLogger({ name: 'foo' })
    })).to.not.throw()
  })

  it('fails if logger doesn\'t have child function', () => {
    expect(() => createApp(function *() { yield null }, {
      logger: {}
    })).to.throw(/logger must have a child method/)
  })

  it('adds logger to request', (done) => {
    const request = createApp(function *(next) {
      if (this.log) this.body = 'success'
      else this.body = 'failure'
      yield next
    }, {
      logger: bunyan.createLogger({ name: 'foo' })
    })
    request.get('/')
      .expect('success')
      .end(done)
  })

  it('allows customization to where it gets saved to', (done) => {
    const request = createApp(function *(next) {
      if (this.logger) this.body = 'success'
      else this.body = 'failure'
      yield next
    }, {
      logger: bunyan.createLogger({ name: 'foo' }),
      path: 'logger'
    })
    request.get('/')
      .expect('success')
      .end(done)
  })

  it('allows you to add custom meta data based on request', (done) => {
    const logSpy = chai.spy((data) => {
      expect(data.id).to.be.equal('foo')
    })
    const request = createApp(function *(next) {
      this.log.info('foo')
      this.body = 'success'
      yield next
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

    return request.get('/')
      .expect('success')
      .end(done)
  })

})
