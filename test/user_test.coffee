assert = require('assert')
gently = new (require('gently'))
userAPI = require('../lib/conjur/user')

describe 'User', ->
  account = 'the-account'
  endpoints = {
    authn: (account)->
      'http://authn-#{account}-conjur.example.com'
    directory: (account)->
      'http://core-#{account}-conjur.example.com'
  }
  username = 'the-username'
  token = {
    data: username
  }
  
  describe '#authenticate', ->
    expectedUsername = 'bob'
    expectedPassword = 'the-password'
    
    beforeEach ->
      authnAPI = require('../lib/conjur/authn')
      
      authenticate = (username, password, cb)->
        if username == expectedUsername && password == expectedPassword
          cb(null)
        else
          cb('Authentication failed')
  
      gently.expect authnAPI, 'connect', (theURL)->
        assert.equal endpoints.authn(account), theURL
        { authenticate: authenticate }
    
    describe 'with expected username and password', ->
      it 'authenticates', (done)->
        user = userAPI.connect(endpoints).user(account, 'bob').authenticate 'the-password', (err)->
          assert !err
          done()
  
    describe 'with invalid password', ->
      it 'authenticates', (done)->
        user = userAPI.connect(endpoints).user(account, 'bob').authenticate 'other-password', (err)->
          assert.equal err, 'Authentication failed'
          done()

  describe '#uidnumbers', ->
    beforeEach ->
      uidnumbers = (logins, cb)->
        cb(null, [ 1001, 1002 ])
  
      dirAPI = require('../lib/conjur/directory')
      gently.expect dirAPI, 'connect', (theURL, theToken)->
        assert.equal endpoints.directory(account), theURL
        assert.deepEqual token, theToken
        { uidnumbers: uidnumbers }
    
    it 'succeeds', (done)->
      user = userAPI.connect(endpoints).users(account, token).uidnumbers [ 'login-1', 'login-2' ], (err, ids)->
        assert !err
        assert.deepEqual ids, [ 1001, 1002 ]
        done()

