assert = require('assert')
gently = new (require('gently'))
g = require('../lib/global')
integration = require('./integration')
conjur_authn = require('../lib/conjur/authn')
conjur_pubkeys = require('../lib/conjur/pubkeys')

endpoints = {
  pubkeys: (account) ->
    assert account == 'ci'
    'https://pubkeys-ci-conjur.herokuapp.com'
}

describe 'conjur_pubkeys', ->
  admin_token = null
  
  before (done)->
    integration.authenticate (err, token)->
      assert !err, g.inspect(err)
      assert token
      admin_token = token
      done()

  describe '#pubkeys', ->
    describe '#show', ->
      it 'shows pubkeys', (done)->
        conjur_pubkeys.connect(endpoints, admin_token).show "ci", "alice@#{integration.userNamespace}", (err, result)->
          assert !err, g.inspect(err)
          assert.notEqual(result.length, 0)
          done()
