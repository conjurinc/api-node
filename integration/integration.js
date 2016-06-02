var u = require('underscore'),
	g = require('../lib/global'),
	authn = require('../lib/conjur/authn');



// Standard for the appliance.
var adminLogin = 'admin',
    adminPassword = 'secret',
    conjurAccount = 'cucumber',
    applianceUrl  = 'https://conjur/api';

/**
 * Authenticate and call cb with (error, token)
 * @param cb function(error, token)
 */
function authenticate(cb){
    authn.connect(applianceUrl + '/authn').authenticate(adminLogin, adminPassword, cb);
}

// HACK disable cert verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


module.exports = {
    authenticate: authenticate,
    adminLogin: adminLogin,
    adminPassword: adminPassword,
    conjurAccount: conjurAccount,
    applianceUrl: applianceUrl
};
