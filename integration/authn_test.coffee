assert = require('assert')
g = require('../lib/global')
I = require('./integration')
authn = require('../lib/conjur/authn')

describe 'Authentication API', ->
  describe 'authn.authenticate()', ->
    describe 'with valid credentials', ->
      it 'issues a token', (done)->
        client = authn.connect(I.applianceUrl + '/authn')
        client.authenticate I.adminLogin, I.adminPassword, (error, token)->
          assert !error, g.inspect(error)
          assert token
          done()

    describe 'with invalid credentials', ->
      it 'is denied', (done)->
        client = authn.connect(I.applianceUrl + '/authn')
        client.authenticate 'foo', 'bar', (err,token) ->
          assert.equal err.message, "Authentication failed: 401"
          assert !token
          done()