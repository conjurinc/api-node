assert = require('assert')
gently = new (require('gently'))
g = require('../lib/global')
conjur_authn = require('../lib/conjur/authn')

describe 'conjur_authn', ()->
  describe '#tokenHeader', ->
    it 'creates an Authorization Token', ->
      assert conjur_authn.tokenHeader('the-token').match /Token token=\"(.*)\"/
  
  describe '#authenticate', ->
    username = 'the-user'
    apiKey = 'the-key'
    
    stubAuthentication = (statusCode)->
      gently.expect g.rest, 'post', (url, body)->
        assert.equal url, 'http://example.com/users/the-user/authenticate'
        assert.deepEqual body, { data: 'the-key' }
        {
          'on': (arg, callback)->
            if arg == 'complete'
              callback('the-token', { statusCode: statusCode })
            else
              throw 'unexpected arg : ' + arg
        }

    describe 'with status code 403', ()->
      it 'is denied', (done)->
        stubAuthentication 403
        conjur_authn.connect('http://example.com').authenticate username, apiKey, (result, token)->
          assert.equal result, 'POST http://example.com/users/the-user/authenticate failed : 403'
          assert !token
          done()
    
    describe 'with status code 200', ()->
      it 'authenticates', (done)->
        stubAuthentication 200
        conjur_authn.connect('http://example.com').authenticate username, apiKey, (result, token)->
          assert !result
          assert.equal token, 'the-token'
          done(result)
