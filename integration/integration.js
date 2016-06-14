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

function resolveNamespace(){
    path = __dirname + "/../conjur.json";

    try{
        var context = require(path);
    }catch(e){
        console.warn("Couldn't load context from '" + path + "'");
        return null;
    }


    var key = u.keys(context)[0];
    var match = /^.*?@(.*)$/.exec(key);

    if(!match){
        console.warn("Couldn't find a namespace in " + key);
        return null;
    }

    return match[1];
}

var namespace = resolveNamespace();

function namespaceUser(user){
    if(namespace){
        return user + "@" + namespace;
    }else{
        return user;
    }
}

function namespaceGroup(group){
    if(namespace){
        return namespace + "/" + group;
    }else{
        return group;
    }
}

// HACK disable cert verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


module.exports = {
    authenticate: authenticate,
    namespace: namespace,
    namespaceUser: namespaceUser,
    namespaceGroup: namespaceGroup,
    adminLogin: adminLogin,
    adminPassword: adminPassword,
    conjurAccount: conjurAccount,
    applianceUrl: applianceUrl
};
