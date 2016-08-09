var u = require('underscore'),
	g = require('../lib/global'),
	authn = require('../lib/conjur/authn');


// Standard for the appliance.
var adminLogin = 'admin',
    adminPassword = 'secret',
    adminApiKey = null,
    conjurAccount = 'cucumber',
    applianceUrl  = 'http://conjur';

// Login as 'admin'
function login (cb) {
    if ( adminApiKey ) {
        cb(null, adminApiKey);
    }
    else {
        authn.connect(applianceUrl).login(conjurAccount, adminLogin, adminPassword, function(err, apiKey) {
            if ( err )
                return cb(err);

            adminApiKey = apiKey;
            cb(null, apiKey)
        });

    }
}

// Authenticate as 'admin'
function authenticate(cb){
    login(function(err, apiKey) {
        if ( err )
            return cb(err);
        authn.connect(applianceUrl).authenticate(conjurAccount, adminLogin, apiKey, cb);
    });
}

module.exports = {
    login: login,
    authenticate: authenticate,
    adminLogin: adminLogin,
    adminPassword: adminPassword,
    conjurAccount: conjurAccount,
    applianceUrl: applianceUrl
};
