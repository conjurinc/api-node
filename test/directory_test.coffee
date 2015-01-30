assert = require('assert')
gently = new (require('gently'))
g = require('../lib/global')
conjur_dir = require('../lib/conjur/directory')

describe 'conjur_dir', ()->
  account = 'the-account'
  token = 'the-token'
  login1 = 'the-login'
  login2 = 'second:login'
  logins = [ login1, login2 ]
  id1 = 1001
  id2 = 1002
  ids = [ id1, id2 ]
  connection = conjur_dir.connect('http://example.com', token)


  describe_number = (numberType, path) ->
    describe "##{numberType}", ->
      stubGet = (result, statusCode)->
        gently.expect g.rest, 'get', (url)->
          assert.equal url, g.format(
            "http://example.com/#{path}/#{numberType}?id[]=%s&id[]=%s",
            encodeURIComponent(login1), encodeURIComponent(login2))
          {
            'on': (arg, callback)->
              if arg == 'complete'
                callback(result, { statusCode: statusCode })
              else
                throw new Error 'unexpected arg : ' + arg
          }

      describe 'with status code 404', ()->
        it 'returns false', (done)->
          stubGet null, 404
          connection[numberType] logins, (err, result)->
            assert err
            assert !result
            done()

      describe 'with status code 200', ()->
        it 'returns the ids', (done)->
          stubGet ids, 200
          connection[numberType] logins, (err, result)->
            assert !err
            assert.deepEqual ids, result
            done()

  describe_number 'uidnumbers', 'users'
  describe_number 'gidnumbers', 'groups'
