assert = require('assert')
gently = new (require('gently'))
g = require('../lib/global')
conjur_authn = require('../lib/conjur/authn')
conjur_authz = require('../lib/conjur/authz')
conjur_pubkeys = require('../lib/conjur/pubkeys')

ns = require('fs').readFileSync('./integration/testdata/ns', 'utf-8').replace(/\s/g, '')
admin = JSON.parse(require('fs').readFileSync('./integration/testdata/admin.json', 'utf-8'))

describe 'conjur_authz', ->
  admin_token = null

  before (done)->
    conjur_authn.connect('https://authn-ci-conjur.herokuapp.com').authenticate admin.login, admin.api_key, (result, token)->
      assert token
      admin_token = token
      done()

  describe '#role', ->
    describe '#memberships', ->
      it 'includes the known group', (done)->
        roleId = [ 'ci', 'user', admin.login ]
        conjur_authz.connect('https://authz-ci-conjur.herokuapp.com', admin_token).role(roleId).memberships (err, result)->
          assert !err, g.inspect(err)
          assert.deepEqual result.sort(), [ "ci:group:#{ns}/admin", "ci:user:#{ns}-admin" ]
          done()

  describe '#group', ->
    describe '#members', ->
      it 'list members of the group', (done)->
        groupId = ['ci', 'group', "#{ns}/#{admin.userid}"]
        conjur_authz.connect('https://authz-ci-conjur.herokuapp.com', admin_token).group(groupId).members (err, result)->
          assert !err, g.inspect(err)
          assert.notEqual(result.length, 0)
          done()

  describe '#pubkeys', ->
    describe '#show', ->
      it 'show pubkeys', (done)->
        conjur_pubkeys.connect('https://authz-ci-conjur.herokuapp.com/api/pubkeys', token).show admin.login, (err, result)->
          assert !err, g.inspect(err)
          assert.notEqual(result.length, 0)
          done()
