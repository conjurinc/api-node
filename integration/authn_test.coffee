assert = require('assert')
winston= require('winston')
gently = new (require('gently'))
g = require('../lib/global')
conjur_authn = require('../lib/conjur/authn')

admin = JSON.parse(require('fs').readFileSync('./integration/testdata/admin.json'))

describe 'conjur_authn', ->
  describe '#authenticate', ->
    describe 'with valid credentials', ->
      it 'issues a token', (done)->
        conjur_authn.connect('https://authn-ci-conjur.herokuapp.com').authenticate admin.login, admin.api_key, (result, token)->
          assert !result, g.inspect(result)
          assert token
          done()

    describe 'with invalid credentials', ->
      it 'is denied', (done)->
        conjur_authn.connect('https://authn-ci-conjur.herokuapp.com').authenticate admin.login, 'foobar', (result, token)->
          winston.debug(g.inspect(result))
          winston.debug(g.inspect(token))
          assert.equal result, "POST https://authn-ci-conjur.herokuapp.com/users/#{admin.login}/authenticate failed : 401"
          assert !token
          done()
      
