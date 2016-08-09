assert = require('assert')
g = require('../lib/global')
I = require('./integration')
authn = require('../lib/conjur/authn')

describe 'Authentication API', ->
  describe 'authn.authenticate()', ->
    describe 'with valid credentials', ->
      it 'issues a token', (done)->
        I.login (err, apiKey)->
          authn.connect(I.applianceUrl).authenticate I.conjurAccount, I.adminLogin, apiKey, (err, token)->
            assert !err, g.inspect(err)
            assert token
            done()

    describe 'with invalid credentials', ->
      it 'is denied', (done)->
        authn.connect(I.applianceUrl).authenticate I.conjurAccount, I.adminLogin, 'baz', (err, token)->
          assert.equal err.message, "Authentication failed: 401"
          assert !token
          done()
