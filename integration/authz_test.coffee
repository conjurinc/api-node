assert = require('assert')
gently = new (require('gently'))
g = require('../lib/global')
conjur_authn = require('../lib/conjur/authn')
conjur_authz = require('../lib/conjur/authz')

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
        conjur_authz.connect('https://authz-ci-v4-conjur.herokuapp.com', admin_token).role(roleId).memberships (err, result)->
          assert !err, g.inspect(err)
          assert.deepEqual result.sort(), [ "ci:group:#{ns}/admin", "ci:user:#{ns}-admin" ]
          done()
