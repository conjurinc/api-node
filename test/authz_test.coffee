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
  identifier = 'bacon'
  token = 'the-token'
  resourceId = [ account, kind, identifier ]
  roleKind = 'the-role-kind'
  roleIdentifier = 'the-role-id'
  roleId = [ account, roleKind, roleIdentifier ]
  resource = conjur_authz.connect('http://example.com', token).resource(resourceId)
  role = conjur_authz.connect('http://example.com', token).role(roleId)

  describe "#role", ->
    describe '#checkPermission', ->
      privilege = 'fry'
      
      stubGet = (statusCode)->
        gently.expect g.rest, 'get', (url, body)->
          assert.equal url, g.format('http://example.com/%s/roles/%s/%s?check&privilege=%s&resource_account=%s&resource_kind=%s&resource_id=%s', account, roleKind, roleIdentifier, privilege, account, kind, identifier)
          {
            'on': (arg, callback)->
              if arg == 'complete'
                callback(null, { statusCode: statusCode })
              else
                throw 'unexpected arg : ' + arg
          }
          
      it 'returns true for 204', (done)->
        stubGet 204
        role.checkPermission resourceId, privilege, (err, allowed)->
          assert !err
          assert allowed
          done()
  
      it 'returns false for 404', (done)->
        stubGet 404
        role.checkPermission resourceId, privilege, (err, allowed)->
          assert !err
          assert !allowed
          done()

    describe '#allowedTo', ->
      permission = 'fry'
      
      stubGet = (result, statusCode)->
        gently.expect g.rest, 'get', (url, body)->
          assert.equal url, g.format('http://example.com/%s/roles/allowed_to/%s/%s/%s', account, permission, kind, identifier)
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
          resource.allowedTo permission, (err, result)->
            assert.deepEqual err, { code: 404, message: "HTTP status code 404 fetching 'http://example.com/the-account/roles/allowed_to/fry/pig/bacon'" }
            assert !result
            done()
      
      describe 'with status code 200', ()->
        it 'returns the result', (done)->
          expectedResult = [ 'the-account:user:the-user' ]
          stubGet [ { id: { account: account, id: 'user:the-user' } } ], 200
          resource.allowedTo permission, (err, result)->
            assert !err
            assert.deepEqual expectedResult, result
            done()
    
  describe "#resource", ->
    describe '#exists', ->
      stubHead = (statusCode)->
        gently.expect g.rest, 'head', (url, body)->
          assert.equal url, g.format('http://example.com/%s/resources/%s/%s', account, kind, identifier)
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
          resource.exists (err, exists)->
            assert !err
            assert !exists
            done()
      
      describe 'with status code 200', ()->
        it 'returns true', (done)->
          stubHead 200
          resource.exists (err, exists)->
            assert !err
            assert exists
            done()

    describe '#checkPermission', ->
      privilege = 'fry'
      
      stubGet = (statusCode)->
        gently.expect g.rest, 'get', (url, body)->
          assert.equal url, g.format('http://example.com/%s/resources/%s/%s?check&privilege=%s', account, kind, identifier, privilege)
          {
            'on': (arg, callback)->
              if arg == 'complete'
                callback(null, { statusCode: statusCode })
              else
                throw 'unexpected arg : ' + arg
          }
          
      it 'returns true for 204', (done)->
        stubGet 204
        resource.checkPermission privilege, (err, allowed)->
          assert !err
          assert allowed
          done()
  
      it 'returns false for 404', (done)->
        stubGet 404
        resource.checkPermission privilege, (err, allowed)->
          assert !err
          assert !allowed
          done()
        