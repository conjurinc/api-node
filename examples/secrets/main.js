"use strict";

var main = require('../main'),
    crypto = require('crypto'),
    conjur = require('../../lib/index'),
    g = conjur.global,
    u = require('underscore'),
    async = require('async')
    ;

function propagateError(cb) {
    return function (err) {
        cb(err);
    }
}

function reportError(err) {
    if ( err )
        console.log(err);
}

main(function(account, connection) {

    function populateSomeVariables(cbMain) {
        async.waterfall([
            // Search for all variables
            function (cb) {
                connection.authz().resources(account, { kind: 'variable' }, cb);
            },
            // Select all variables whose id is like /password/
            function (variables, cb) {
                var variableIds = u.map(variables, function(r) { return r.id })
                cb(null, u.select(variableIds, function (id) {
                    return id.match(/password/);
                }));
            },
            // Assign a random value to the password
            function (passwordIds, cb) {
                async.map(passwordIds,
                    function(passwordId, cbPassword) {
                        crypto.randomBytes(16, function(err, buf) {
                            if ( err ) return cbPassword(err);

                            console.log("Setting %s\t=\t%s", passwordId, buf.toString('base64'));
                            connection.secrets().secret(passwordId).update(buf.toString('base64'), cbPassword);
                        });
                    },
                    propagateError(cb)
                );
            }
        ], propagateError(cbMain));
    }

    function fetchAllVariables(cbMain) {
        async.waterfall([
            // Search for all variables
            function (cb) {
                connection.authz().resources(account, { kind: 'variable' }, cb);
            },        
            function (variables, cb) {
                var variableIds = u.map(variables, function(r) { return r.id })
                console.log("There are %s variables:", variableIds.length);
                async.map(variableIds,
                    function(id, cbValue) {
                        connection.secrets().secret(id).fetch(function (err, value) {
                            if ( err && err.code === 404 ) {
                                err = null;
                                console.log("%s\t=\t<empty>", id);
                            }
                            else if ( err ) {
                                cbValue(err);
                            }
                            else {
                                console.log("%s\t=\t%s", id, value);
                            }
                            cbValue(err);
                        });
                    }, 
                    propagateError(cb)
                )
            }
        ], propagateError(cbMain));
    }

    async.series([
        populateSomeVariables,
        fetchAllVariables
    ], reportError);
});
