assert = require('assert')
gently = new (require('gently'))
g = require('../lib/global')
I = require('./integration')
authz = require('../lib/conjur/authz')

describe 'conjur_authz', ->
  admin_token = null
  
  before (done)->
    I.authenticate (err, token) ->
      assert !err, err
      admin_token = token
      done()

  describe '#role', ->
    describe '#show', ->
      it 'includes the known user', (done)->
        roleId = [I.conjurAccount, 'group', 'everyone' ];
        authz.connect(I.applianceUrl, admin_token).role(roleId).show (err, result)->
          assert !err, g.inspect(err)
          members = g.u.map result.members, (m)->
            m.member
          assert.deepEqual members.sort(), [
            "#{I.conjurAccount}:user:admin",
            "#{I.conjurAccount}:user:alice" ]
          done()

    describe '#memberships', ->
      it 'includes the known group', (done)->
        roleId = [ I.conjurAccount, 'user', 'alice' ]
        authz.connect(I.applianceUrl, admin_token).role(roleId).memberships (err, result)->
          assert !err, g.inspect(err)
          assert.deepEqual result.sort(), [
            "#{I.conjurAccount}:group:everyone",
            "#{I.conjurAccount}:user:alice" ]
          done()
