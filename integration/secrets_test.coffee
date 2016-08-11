assert = require('assert')
gently = new (require('gently'))
g = require('../lib/global')
I = require('./integration')
secrets = require('../lib/conjur/secrets')

describe 'conjur_secrets', ->
  admin_token = null
  
  before (done)->
    I.authenticate (err, token) ->
      assert !err, err
      admin_token = token
      done()

  describe '#secrets', ->
    describe '#update', ->
      it 'adds a new secret value and then fetches it', (done)->
        resourceId = [I.conjurAccount, 'variable', 'db-password' ];
        secrets.connect(I.applianceUrl, admin_token).secret(resourceId).update 'new-value', (err, result)->
          assert !err, g.inspect(err)
          secrets.connect(I.applianceUrl, admin_token).secret(resourceId).fetch (err, result)->
            assert !err, g.inspect(err)
            assert.equal 'new-value', result
            done()
