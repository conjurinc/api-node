An example which performs the following:

* Lists all the resources in Conjur.
* Attempts to fetch the latest secret value of every variable.
* Lists the public keys of every user.

Configuration is taken from the environment:

* `CONJUR_URL` base connection URL.
* `CONJUR_ACCOUNT` account name.
* `CONJUR_AUTHN_LOGIN` login name.
* `CONJUR_AUTHN_PASSWORD` password, if API key is not known.
* `CONJUR_AUTHN_API_KEY` API key corresponding to the login. May be empty if the password is provided.

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
Connecting...
info: POST http://conjur/authn/cucumber/admin/authenticate
Connected.
info: GET: http://conjur/resources/cucumber
Available resources:
[ 'cucumber:user:test',
  'cucumber:webservice:the-service',
  'cucumber:user:alice',
  'cucumber:public_key:user/alice/alice@home',
  'cucumber:group:everyone',
  'cucumber:variable:db-password' ]
Parsing resource ids...
Fetching value of variables cucumber,variable,db-password
info: GET: http://conjur/secrets/cucumber/variable/db-password
Values:
[ 'new-value' ]
Fetching public keys of users test,alice
info: GET: http://conjur/public_keys/cucumber/user/test
info: GET: http://conjur/public_keys/cucumber/user/alice
Public keys:

ssh-rsa AAAAB3NzHhIqxF alice@home

```
