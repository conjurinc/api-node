assert = require('assert')
config = require('../lib/conjur/config')

describe 'config', ()->
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
   
  describe 'env = production', ->
    env = 'production'
    stack = 'ci'
    
    describe 'environment variables', ->
      account = 'test'
      before ->
        process.env.CONJUR_AUTHN_URL = 'https://localhost:443/api/authn'
        process.env.CONJUR_AUTHZ_URL = 'https://localhost:443/api/authz'
        process.env.CONJUR_CORE_URL = 'https://localhost:443/api'
      after ->
        delete process.env['CONJUR_AUTHN_URL']
        delete process.env['CONJUR_AUTHZ_URL']
        delete process.env['CONJUR_CORE_URL']

      it 'authn matches expectation', ->
        assert.equal config.authnUrl(env, stack, account), 'https://localhost:443/api/authn/'
      it 'authz matches expectation', ->
        assert.equal config.authzUrl(env, stack, account), 'https://localhost:443/api/authz/'
      it 'directory matches expectation', ->
        assert.equal config.directoryUrl(env, stack, account), 'https://localhost:443/api/'
    
    describe 'applianceUrl', ->
      account = 'test'
      before ->
        config.applianceUrl = 'https://localhost:443/api'
      after ->
        config.applianceUrl = null
      it 'authn matches expectation', ->
        assert.equal config.authnUrl(env, stack, account), 'https://localhost:443/api/authn/'
      it 'authz matches expectation', ->
        assert.equal config.authzUrl(env, stack, account), 'https://localhost:443/api/authz/'
      it 'directory matches expectation', ->
        assert.equal config.directoryUrl(env, stack, account), 'https://localhost:443/api/'
        
    describe 'stack = ci', ->
      stack = 'ci'
      describe 'account = test', ->
        account = 'test'
        it 'authn matches expectation', ->
          assert.equal config.authnUrl(env, stack, account), 'https://authn-test-conjur.herokuapp.com'
        it 'authz matches expectation', ->
          assert.equal config.authzUrl(env, stack, account), 'https://authz-ci-conjur.herokuapp.com'
  
