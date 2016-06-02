assert = require('assert')
gently = new (require('gently'))
g = require('../lib/global')
integration = require('./integration')
conjur_authz = require('../lib/conjur/authz')

describe 'conjur_authz', ->
  admin_token = null
  
  before (done)->
    integration.authenticate done, (token) ->
      admin_token = token

  describe '#role', ->
    describe '#members', ->
      it 'includes the known user', (done)->
        roleId = [ 'ci', 'group', "#{integration.resourceNamespace}/everyone" ]
        conjur_authz.connect('https://authz-ci-conjur.herokuapp.com', admin_token).role(roleId).members (err, result)->
          assert !err, g.inspect(err)
          members = g.u.map result, (m)->
            m.member
          assert.deepEqual members.sort(), [ "ci:user:admin@#{integration.userNamespace}", "ci:user:alice@#{integration.userNamespace}" ]
          done()

    describe '#memberships', ->
      it 'includes the known group', (done)->
        roleId = [ 'ci', 'user', "alice@#{integration.userNamespace}" ]
        conjur_authz.connect('https://authz-ci-conjur.herokuapp.com', admin_token).role(roleId).memberships (err, result)->
          assert !err, g.inspect(err)
          assert.deepEqual result.sort(), [ "ci:group:#{integration.resourceNamespace}/everyone", "ci:user:alice@#{integration.userNamespace}" ]
          done()
