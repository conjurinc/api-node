var assert = require('assert'),
    conjur = require('../../lib/index'),
    process = require('process'),
    u = require('underscore')
    ;

if (require.main === module) {
    var baseUrl = process.env.CONJUR_URL;
    var account = process.env.CONJUR_ACCOUNT;
    var login = process.env.CONJUR_AUTHN_LOGIN;
    var password = process.env.CONJUR_AUTHN_PASSWORD;
    var apiKey = process.env.CONJUR_AUTHN_API_KEY;

    console.log('=========================================================================');
    console.log('Base url:', baseUrl);
    console.log('Account:', account);
    console.log('Login:', login);
    console.log('Password:', password);
    console.log('API key:', apiKey);
    console.log('=========================================================================');
    console.log();

    function perform() {
        conjur.connect(baseUrl, account, login, apiKey, function(err, connection) {
            connection.authz().resources(account, function(err, resources) {
                console.log("Available resources:");
                console.log(u.map(resources, function(r) { return r.id }));
            });
        });
    }

    if ( !apiKey ) {
        conjur.authn.connect(baseUrl).login(account, login, password, function(err, theApiKey) {
            if ( err ) {
                console.log(err);
                return process.exit(1);
            }
            console.log("Logged in");
            apiKey = theApiKey;
            perform();
        });
    }
    else {
        perform();
    }
}
