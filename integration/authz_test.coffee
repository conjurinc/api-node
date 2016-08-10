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

  describe '#resource', ->
    describe '#search', ->
      it 'finds the known group', (done)->
        authz.connect(I.applianceUrl, admin_token).resources 'cucumber', { kind: 'group' }, (err, result)->
          assert !err, g.inspect(err)
          ids = g.u.map result, (m)->
            m.id
          assert.deepEqual ids.sort(), [
            "#{I.conjurAccount}:group:everyone"
          ]
          done()

    describe '#show', ->
      it 'includes the known group', (done)->
        resourceId = [I.conjurAccount, 'group', 'everyone' ];
        authz.connect(I.applianceUrl, admin_token).resource(resourceId).show (err, result)->
          assert !err, g.inspect(err)
          assert.equal result.id, 'cucumber:group:everyone'
          done()

    describe '#permittedRoles', ->
      it 'indicates that alice,admin,test can execute the webservice', (done)->
        resourceId = [I.conjurAccount, 'webservice', 'the-service' ];
        authz.connect(I.applianceUrl, admin_token).resource(resourceId).permittedRoles 'execute', (err, result)->
          assert !err, g.inspect(err)
          assert.deepEqual result.sort(), [
            'cucumber:user:admin',
            'cucumber:user:alice',
            'cucumber:user:test'
          ]
          done()

      it 'indicates that admin can execute the group', (done)->
        resourceId = [I.conjurAccount, 'group', 'everyone' ];
        authz.connect(I.applianceUrl, admin_token).resource(resourceId).permittedRoles 'execute', (err, result)->
          assert !err, g.inspect(err)
          assert.deepEqual result.sort(), [
            'cucumber:user:admin'
          ]
          done()

    describe '#checkPermission', ->
      it 'indicates that admin can fry the webservice', (done)->
        resourceId = [I.conjurAccount, 'webservice', 'the-service' ];
        authz.connect(I.applianceUrl, admin_token).resource(resourceId).checkPermission 'execute', (err, result)->
          assert !err, g.inspect(err)
          assert.equal true, result
          done()

  describe '#role', ->
    describe '#show', ->
      it 'includes the known group', (done)->
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

    describe '#checkPermission', ->
      it 'indicates that alice can execute the webservice', (done)->
        roleId = [ I.conjurAccount, 'user', 'alice' ]
        authz.connect(I.applianceUrl, admin_token).role(roleId).checkPermission [ I.conjurAccount, 'webservice', 'the-service' ], 'execute', (err, result)->
          assert !err, g.inspect(err)
          assert.equal true, result
          done()

      it 'indicates that alice cannot fry the webservice', (done)->
        roleId = [ I.conjurAccount, 'user', 'alice' ]
        authz.connect(I.applianceUrl, admin_token).role(roleId).checkPermission [ I.conjurAccount, 'webservice', 'the-service' ], 'fry', (err, result)->
          assert !err, g.inspect(err)
          assert.equal false, result
          done()
