assert = require('assert')
config = require('../lib/conjur/config')

describe 'config', ()->
  describe 'applianceEndpoints', ->
    applianceUrl = 'https://conjur/api'
    account = 'the-account'
    
  describe 'env = development', ->
    env = 'development'
    describe 'stack = ci', ->
      stack = 'ci'
      describe 'account = test', ->
        account = 'test'
        it 'authn matches expectation', ->
          assert.equal config.authnUrl(env, stack, account), 'http://localhost:5000'
        it 'authz matches expectation', ->
          assert.equal config.authzUrl(env, stack, account), 'http://localhost:5100'
        it 'directory matches expectation', ->
          assert.equal config.directoryUrl(env, stack, account), 'http://localhost:5200'
        it 'audit matches expectation', ->
          assert.equal config.auditUrl(env, stack, account), 'http://localhost:5300'
   
  describe 'env = production', ->
    env = 'production'
    describe 'stack = ci', ->
      stack = 'ci'
      describe 'account = test', ->
        account = 'test'
        it 'authn matches expectation', ->
          assert.equal config.authnUrl(env, stack, account), 'https://authn-test-conjur.herokuapp.com'
        it 'authz matches expectation', ->
          assert.equal config.authzUrl(env, stack, account), 'https://authz-ci-conjur.herokuapp.com'
        it 'directory matches expectation', ->
          assert.equal config.directoryUrl(env, stack, account), 'https://core-test-conjur.herokuapp.com'
        it 'audit matches expectation', ->
          assert.equal config.auditUrl(env, stack, account), 'https://audit-ci-conjur.herokuapp.com'
  
