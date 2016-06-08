# Conjur API for Node.js

## Usage

The `conjur` module provides an entry point to the api:

```js
var conjur = require('conjur');
```

### Authentication


```js
var conjurApplianceUrl = 'https://conjur.example.org/api';

var authnClient = conjur.authn.connect(conjurApplianceUrl + '/authn');

// The authenticate method takes a username and a password or API key
// and a callback to receive a Conjur authentication token.

authnClient.authenticate('alice', 'super-secret-password', function(error, token){
    if(error){
       // handle an authentication error
    }else{
       // use the token to perform actions as 'alice' in conjur.
    }
});
```

### Roles and Resources

To work with the Conjur RBAC model, you can use the `authz` API.  You will need a token from
`authn.authenticate` to do so.  For the sake of simplicity, we'll assume you already have one.

#### Create an authz client:
```js
var authzClient = conjur.authz.connect(conjurApplianceUrl + '/authz', token);

// list resources with kind 'webservice'.  Other options are `search` and `owner`
authzClient.resources

```

#### Search for resources
```js


```



# Testing

* Install dependencies
```
    $ npm install
```

* Configure gulp reporting (optional)
```
    # To write reports to a file in xunit format
    $ export TEST_REPORTER=xunit-file
    $ export XUNIT_FILE=reports/report.xml
```

* Run jslint and tests
```
    $ gulp
```
