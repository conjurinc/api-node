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
    describe '#members', ->
      it 'includes the known user', (done)->
        roleId = [I.conjurAccount, 'group', I.namespaceGroup('everyone') ];
        authz.connect(I.applianceUrl + '/authz', admin_token).role(roleId).members (err, result)->
          assert !err, g.inspect(err)
          members = g.u.map result, (m)->
            m.member
          assert.deepEqual members.sort(), [
            "#{I.conjurAccount}:user:admin",
            "#{I.conjurAccount}:user:#{I.namespaceUser('alice')}" ]
          done()

    describe '#memberships', ->
      it 'includes the known group', (done)->
        roleId = [ I.conjurAccount, 'user', I.namespaceUser('alice') ]
        authz.connect(I.applianceUrl + '/authz', admin_token).role(roleId).memberships (err, result)->
          assert !err, g.inspect(err)
          assert.deepEqual result.sort(), [
            "#{I.conjurAccount}:group:#{I.namespaceGroup('everyone')}",
            "#{I.conjurAccount}:user:#{I.namespaceUser('alice')}" ]
          done()
