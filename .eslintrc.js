'use strict'

module.exports = {
  root: true,
  parser: 'espree',
  extends: [
    'ksmithut',
    'ksmithut/es6',
    'ksmithut/node',
    'ksmithut/mocha'
  ],
  rules: {
    strict: 0,
    'prefer-rest-params': 0,
    'no-invalid-this': 0,
    'prefer-reflect': 0
  }
}