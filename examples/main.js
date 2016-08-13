"use strict";

var assert = require('assert'),
    conjur = require('../lib/index'),
    process = require('process'),
    winston = require('winston')
    ;

module.exports = function(fn) {
  var baseUrl = process.env.CONJUR_URL;
  var account = process.env.CONJUR_ACCOUNT;
  var login = process.env.CONJUR_AUTHN_LOGIN;
  var password = process.env.CONJUR_AUTHN_PASSWORD;
  var apiKey = process.env.CONJUR_AUTHN_API_KEY;

  winston.level = 'warn';

  console.log('=========================================================================');
  console.log('Base url :', baseUrl );
  console.log('Account  :', account );
  console.log('Login    :', login   );
  console.log('Password :', password);
  console.log('API key  :', apiKey  );
  console.log('=========================================================================');
  console.log();

  function perform(apiKey) {
    console.log("Connecting...");
    conjur.connect(baseUrl, account, login, apiKey, function(err, connection) {
        if ( err ) {
          console.log(err);
          return process.exit(1);
        }

        console.log("Connected.");
        fn(account, connection);
    });
  }

  // If the API key is not provided, the password can be used to obtain it.
  if ( !apiKey ) {
      conjur.authn.connect(baseUrl).login(account, login, password, function(err, theApiKey) {
          if ( err ) {
              console.log(err);
              return process.exit(1);
          }
          console.log("Logged in");
          perform(theApiKey);
      });
  }
  else {
      perform(apiKey);
  }
}