# Conjur API for Node.js

## Usage

```js
var Conjur = require('conjur'),
    Config = Conjur.Config, // or require('conjur/config')
    Authn  = Conjur.Authn;  // or require('conjur/authn');


// with explicit config
var config = new Config({
    applianceUrl: 'https://conjur/api',
    account: 'conjur',
    cert: '/etc/ssl/conjur.pem'
});

// read config from environment variables
var config = Config.fromEnvironment();

// use for all instances of Conjur not given a config
conjur.setDefaultConfig(config);

// Create an api with the given login, password and config
var api = new Conjur('username', 'password', config);

// Create an api an authn token
api = new Conjur(token);

// Create an Authn API
var authn =
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
