Simple example which lists all the resources in Conjur.

Usage:

```sh-session
$ env CONJUR_URL=http://conjur CONJUR_ACCOUNT=cucumber CONJUR_AUTHN_LOGIN=admin CONJUR_AUTHN_PASSWORD=secret node examples/resource-list/app.js
=========================================================================
Base url: http://conjur
Account: cucumber
Login: admin
Password: secret
API key: undefined
=========================================================================

info: GET http://conjur/authn/cucumber/login
info: GET: http://conjur/authn/cucumber/login
Logged in
info: POST http://conjur/authn/cucumber/admin/authenticate
info: GET: http://conjur/resources/cucumber
Available resources:
[ 'cucumber:user:test',
  'cucumber:webservice:the-service',
  'cucumber:user:alice',
  'cucumber:public_key:user/alice/alice@home',
  'cucumber:group:everyone',
  'cucumber:variable:db-password' ]
```
