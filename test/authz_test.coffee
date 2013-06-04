assert = require('assert')
gently = new (require('gently'))
g = require('../lib/global')
conjur_authz = require('../lib/conjur/authz')

describe 'conjur_authz', ()->
  describe '#parseResourceId', ->
    it 'interprents an Array', ->
      assert.deepEqual conjur_authz.parseResourceId([1,2,3]), {"account":"1","kind":"2","identifier":["3"]}
    it 'parses a string', ->
      assert.deepEqual conjur_authz.parseResourceId([1,2,3].join(':')), {"account":"1","kind":"2","identifier":["3"]}

  account = 'the-account'
  kind = 'pig'
  id = 'bacon'
  token = 'the-token'
  resourceId = [ account, kind, id ]
  connection = conjur_authz.connect('http://example.com', token).resource(resourceId)

  describe '#exists', ->
    stubHead = (statusCode)->
      gently.expect g.rest, 'head', (url, body)->
        assert.equal url, g.format('http://example.com/%s/resources/%s/%s', account, kind, id)
        {
          'on': (arg, callback)->
            if arg == 'complete'
              callback(null, { statusCode: statusCode })
            else
              throw 'unexpected arg : ' + arg
        }

    describe 'with status code 404', ()->
      it 'returns false', (done)->
        stubHead 404
        connection.exists (err, exists)->
          assert !err
          assert !exists
          done()
    
    describe 'with status code 200', ()->
      it 'returns true', (done)->
        stubHead 200
        connection.exists (err, exists)->
          assert !err
          assert exists
          done()

  describe '#allowedTo', ->
    permission = 'fry'
    
    stubGet = (result, statusCode)->
      gently.expect g.rest, 'get', (url, body)->
        assert.equal url, g.format('http://example.com/%s/roles/allowed_to/%s/%s/%s', account, permission, kind, id)
        {
          'on': (arg, callback)->
            if arg == 'complete'
              callback(result, { statusCode: statusCode })
            else
              throw 'unexpected arg : ' + arg
        }

    describe 'with status code 404', ()->
      it 'fails', (done)->
        stubGet [], 404
        connection.allowedTo permission, (err, result)->
          assert err == "GET http://example.com/the-account/roles/allowed_to/fry/pig/bacon failed : 404"
          assert !result
          done()
    
    describe 'with status code 200', ()->
      it 'returns the result', (done)->
        expectedResult = [ 'the-account:user:the-user' ]
        stubGet [ { id: { account: account, id: 'user:the-user' } } ], 200
        connection.allowedTo permission, (err, result)->
          assert !err
          assert.deepEqual expectedResult, result
          done()
        