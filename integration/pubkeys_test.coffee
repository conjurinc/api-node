assert = require('assert')
g = require('../lib/global')
I = require('./integration')
Pubkeys = require('../lib/conjur/pubkeys')

describe 'conjur_pubkeys', ->
  describe '#pubkeys', ->
    describe '#show', ->
      it 'shows pubkeys without authentication', (done)->
        Pubkeys.connect(I.applianceUrl).show I.conjurAccount, 'user', 'alice', (err, result)->
          assert !err, g.inspect(err)
          assert.equal result, 'ssh-rsa blahblah alice@whatever'
          done()
