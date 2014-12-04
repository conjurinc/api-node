assert = require('assert')
winston= require('winston')
gently = new (require('gently'))
g = require('../lib/global')
integration = require('./integration')
conjur_authn = require('../lib/conjur/authn')

describe 'conjur_authn', ->
  describe '#authenticate', ->
    describe 'with valid credentials', ->
      it 'issues a token', (done)->
        integration.authenticate (result, token)->
          assert !result, g.inspect(result)
          assert token
          done()

    describe 'with invalid credentials', ->
      it 'is denied', (done)->
        conjur_authn.connect('https://authn-ci-conjur.herokuapp.com').authenticate integration.adminLogin, 'foobar', (result, token)->
          assert.equal result, "POST https://authn-ci-conjur.herokuapp.com/users/#{encodeURIComponent integration.adminLogin}/authenticate failed : 401"
          assert !token
          done()
      
