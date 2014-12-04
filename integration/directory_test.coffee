assert = require('assert')
gently = new (require('gently'))
g = require('../lib/global')
integration = require('./integration')
conjur_authn = require('../lib/conjur/authn')
conjur_group = require('../lib/conjur/group')

endpoints = {
  authz: (account) ->
    assert account == 'ci'
    'https://authz-ci-conjur.herokuapp.com'
}

describe 'conjur_directory', ->
  admin_token = null
  
  before (done)->
    integration.authenticate (err, token)->
      assert !err, g.inspect(err)
      assert token
      admin_token = token
      done()

  describe '#group', ->
    describe '#members', ->
      it 'list members of the group', (done)->
        conjur_group.connect(endpoints, admin_token).group('ci', "#{integration.resourceNamespace}/everyone").members (err, result)->
          assert !err, g.inspect(err)
          assert.notEqual(result.length, 0)
          done()
