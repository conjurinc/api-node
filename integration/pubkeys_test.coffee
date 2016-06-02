assert = require('assert')
g = require('../lib/global')
I = require('./integration')
Pubkeys = require('../lib/conjur/pubkeys')

endpoints = {
  pubkeys: (account) -> I.applianceUrl + '/pubkeys'
}

describe 'conjur_pubkeys', ->
  admin_token = null
  before (done)->
    I.authenticate (err, token)->
      admin_token = token
      done()

  describe '#pubkeys', ->
    describe '#show', ->
      it 'shows pubkeys', (done)->
        pubkeys = Pubkeys.connect endpoints, admin_token
        pubkeys.show I.conjurAccount, I.namespaceUser('alice'), (err, result)->
          assert !err, g.inspect(err)
          assert.equal result, 'ssh-rsa blahblah alice@whatever'
          done()
