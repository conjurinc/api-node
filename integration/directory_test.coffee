assert = require('assert')
g = require('../lib/global')
I = require('./integration')
authn = require('../lib/conjur/authn')
groups = require('../lib/conjur/group')

endpoints = {
  authz: (account) -> I.applianceUrl + '/authz'
}

describe 'conjur_directory', ->
  admin_token = null
  
  before (done)->
    I.authenticate (err, token)->
      admin_token = token
      done()

  describe '#group', ->
    describe '#members', ->
      it 'lists members of the group', (done)->
        client = groups.connect(endpoints, admin_token)
        client.group(I.conjurAccount, I.namespaceGroup('everyone')).members (err, result)->
          assert !err, g.inspect(err)
          console.log("results " + g.inspect(result));
          members = result.map (r) -> r.member.split(':')[2]
          assert.deepEqual members.sort(), ['admin', I.namespaceUser('alice')]
          done()
