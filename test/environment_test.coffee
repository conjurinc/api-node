assert = require('assert')
gently = new (require('gently'))
g = require('../lib/global')
environmentAPI = require('../lib/conjur/environment')

describe 'Environment', ->
  account = 'the-account'
  name = 'the-environment'
  value = 'the-value'
  key = 'the-var-key'
  variableid = 'the-variable'
  username = 'the-user'
  token = {
    data: username
  }
  endpoints = {
    directory: (account)->
      "http://core-#{account}-conjur.example.com"
  }
  
  describe '#value', ->
    environment = {
      variables: {
        'the-var-key': variableid
      }
    }
    
    mockURL = (path, err, result)->
      gently.expect require('../lib/global'), 'getURL', (_url, _options, cb)->
        assert.equal _url, "http://core-the-account-conjur.example.com/#{path}"
        assert.deepEqual _options, { headers: { Authorization: 'Token token="eyJkYXRhIjoidGhlLXVzZXIifQ=="' } }
        cb err, result
      
    context 'with default version', ->
      context 'when the environment is not found', ->
        it 'returns 404', (done)->
          mockURL "environments/#{name}", {code: 404}
          environmentAPI.connect(endpoints).environment(account, name, token).value key, (err, _value)->
            assert.deepEqual err, {code:404}
            done()
      
      context 'when the variable is not found', ->
        it 'returns 404', (done)->
          mockURL "environments/#{name}", null, environment
          mockURL "variables/#{variableid}/value", {code: 404}
          environmentAPI.connect(endpoints).environment(account, name, token).value key, (err, _value)->
            assert.deepEqual err, {code:404}
            done()
      
      it 'fetches the value', (done)->
        mockURL "environments/#{name}", null, environment
        mockURL "variables/#{variableid}/value", null, value
        environmentAPI.connect(endpoints).environment(account, name, token).value key, (err, _value)->
          assert !err, g.inspect(err)
          assert.equal _value, value
          done()

    context 'with explicit version', ->
      it 'fetches the value', (done)->
        mockURL "environments/#{name}", null, environment
        mockURL "variables/#{variableid}/value?version=10", null, value
        environmentAPI.connect(endpoints).environment(account, name, token).value key, 10, (err, _value)->
          assert !err, g.inspect(err)
          assert.equal _value, value
          done()
