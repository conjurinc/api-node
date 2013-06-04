assert = require('assert')
gently = new (require('gently'))
hostAPI = require('../lib/conjur/host')

describe 'Host', ->
  account = 'the-account'
  hostname = 'the-host'
  token = username = host = null
  endpoints = {
    authn: (account)->
      'http://authn-#{account}-conjur.example.com'
    authz: (account)->
      'http://authz-api-conjur.example.com'
  }
  
  build_host = (username)->
    token = { data: username }
    host = hostAPI.connect(endpoints).host(account, hostname, token)
  
  describe '#currentRole', ->
    describe 'as user', ->
      beforeEach ->
        build_host 'the-username'
      it 'matches', ->
        assert.equal host.currentRole, [ account, 'user', 'the-username' ].join(':')
    describe 'as host', ->
      beforeEach ->
        build_host 'host/the-host'
      it 'matches', ->
        assert.equal host.currentRole, [ account, 'host', 'the-host' ].join(':')

  describe '#visibleTo', ->
    describe 'when the logged in user', ->
      describe 'is the host', ->
        before ->
          build_host 'host/the-host'
        it 'shortcuts', (done)->
          host.visibleTo (err, result)->
            assert !err
            assert result == true
            done()

      describe 'is not the host', ->
        buildRolesWithAccessTo = (roles)->
          gently.expect host, 'rolesWithAccessTo', (callback)->
            callback(null, roles)

        before ->
          build_host 'the-user'

        describe 'and the role list contains the current role', ->
          user_role_id = (username)->
            [ account, 'user', username ].join(':')
          
          before ->
            roles = {}
            roles[user_role_id('the-user')] = [ 'update' ]
            buildRolesWithAccessTo roles
            
          it 'is true', (done)->
            host.visibleTo (err, result)->
              assert !err
              assert result == true
              done()  
          
        describe 'and the role list does not contain the current role', ->
          before ->
            buildRolesWithAccessTo {}
            
          it 'is false', (done)->
            host.visibleTo (err, result)->
              assert !err
              assert result == false
              done()  

  describe '#verifyVisibleTo', ->
    describe 'when the host is visible', ->
      beforeEach ->
        gently.expect host, 'visibleTo', (callback)->
          callback(null, true)
      it 'does not error', (done)->
        host.verifyVisibleTo (err)->
          assert !err
          done()
        
    describe 'when the host is not visible', ->
      beforeEach ->
        gently.expect host, 'visibleTo', (callback)->
          callback(null, false)
      it 'does error', (done)->
        host.verifyVisibleTo (err)->
          assert err
          done()
        
  describe '#rolesWithAccessTo', ->
    user_role_id = (username)->
      [ account, 'user', username ].join(':')
    
    allowedToExecute = (user_role_id(name) for name in [ 'bob', 'jane' ])
    allowedToUpdate  = (user_role_id(name) for name in [ 'bob', 'jack' ])
    
    beforeEach ->
      authzAPI = require('../lib/conjur/authz')
      
      allowedTo = (permission, cb)->
        if permission == 'execute'
          cb(null, allowedToExecute)
        else if permission == 'update'
          cb(null, allowedToUpdate)
        else
          cb("Unexpected permission: #{permission}")
      
      resource = (resourceId)->
        assert.deepEqual [ account, 'host', hostname ], resourceId
        { allowedTo: allowedTo }
      
      [0,1].forEach ->
        gently.expect authzAPI, 'connect', (theURL, theToken)->
          assert.equal token, theToken
          { resource: resource }
    
    it 'builds map of user to permission', (done)->
      host.rolesWithAccessTo (err, result)->
        assert !err
        assert.deepEqual {"the-account:user:bob":["execute","update"],"the-account:user:jane":["execute"],"the-account:user:jack":["update"]}, result
        done()
