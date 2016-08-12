var assert = require('assert'),
    conjur = require('../../lib/index'),
    g = conjur.global,
    process = require('process'),
    u = require('underscore'),
    async = require('async')
    ;

if (require.main === module) {
    var baseUrl = process.env.CONJUR_URL;
    var account = process.env.CONJUR_ACCOUNT;
    var login = process.env.CONJUR_AUTHN_LOGIN;
    var password = process.env.CONJUR_AUTHN_PASSWORD;
    var apiKey = process.env.CONJUR_AUTHN_API_KEY;

    console.log('=========================================================================');
    console.log('Base url :', baseUrl);
    console.log('Account  :', account);
    console.log('Login    :', login);
    console.log('Password :', password);
    console.log('API key  :', apiKey);
    console.log('=========================================================================');
    console.log();

    var connection = null;
    function perform() {
        async.waterfall([
            function (cb) {
                console.log("Connecting...");
                conjur.connect(baseUrl, account, login, apiKey, cb);
            },
            function (newConnection, cb) {
                console.log("Connected.");
                connection = newConnection;
                connection.authz().resources(account, cb);
            },
            function (resources, cb) {
                console.log("Available resources:");
                var ids = u.map(resources, function(r) { return r.id })
                console.log(ids);
                cb(null, ids);
            },
            function(resourceIds, cb) {
                console.log("Parsing resource ids...");
                resourceIds = u.map(resourceIds, function(id) {
                    return g.parseId(id);
                });

                var variables = u.map(u.select(resourceIds, function(id) {
                    return id.kind === "variable";
                }), function(v) {
                    return [ v.account, v.kind, v.identifier ];
                });
                var users = u.map(u.select(resourceIds, function(id) {
                    return id.kind === "user";
                }), function(v) {
                    return [ v.account, v.kind, v.identifier ];
                });

                async.series([
                    // Fetch variable values
                    function(ccb) {
                        console.log("Fetching value of variables %s", variables);
                        async.map(variables,
                            function(id, vcb) {
                                connection.secrets().secret(id).fetch(function (err, value) {
                                    if ( err ) {
                                        if ( err.code == 404 ) {
                                            err = null;
                                            value = null;
                                        }
                                        else {
                                            return vcb(err);
                                        }
                                    }
                                    return vcb(err, value);
                                });
                            },
                            function(err, values) {
                                console.log("Values:");
                                console.log(values);
                                ccb(null);
                            });
                    },
                    // Fetch user public keys
                    function(ccb) {
                        console.log("Fetching public keys of users %s", u.map(users, function(u) { return u[2] }));
                        async.map(users,
                            function(id, vcb) {
                                var login = id[2];
                                connection.pubkeys().show(account, 'user', login, vcb);
                            },
                            function(err, values) {
                                if ( err ) return cb(err);

                                console.log("Public keys:");
                                console.log(values.join(""));
                                ccb(null);
                            });
                    }
                ], cb)
            },
        ],
        function(err) {
            if ( err )
                console.log(err);
        })
    }

    // If the API key is not provided, the password can be used to obtain it.
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
