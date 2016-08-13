"use strict";

var main = require('../main'),
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

    function printGroupMembers(cbMain) {
        async.waterfall([
            // Find all groups
            function (cb) {
                connection.authz().resources(account, { kind: 'group' }, cb);
            },
            // List the members of each group role
            function (groups, cb) {
                async.map(groups,
                    function(group, cbMembers) {
                        connection.authz().role(group.id).show(function(err, role) {
                            if ( err ) return cbMembers(err);

                            console.log("Group %s", g.parseId(group.id).identifier);
                            console.log("  Members:");
                            u.map(role.members, function(member) {
                                console.log("    %s %s", g.parseId(member.member).kind, g.parseId(member.member).identifier);
                            });
                            cbMembers(null);
                        });
                    }, 
                    propagateError(cb));
            }
        ], propagateError(cbMain));
    }


    function printPublicKeys(cbMain) {
        async.waterfall([
            // Find all users
            function (cb) {
                connection.authz().resources(account, { kind: 'user' }, cb);
            },
            function (users, cb) {
                async.map(users,
                    function(user, cbUser) {
                        var login = g.parseId(user.id).identifier;
                        connection.pubkeys().show(account, 'user', login, function (err, keys) {
                            if ( err ) return cbUser(err);

                            console.log("Public keys of %s:", login);
                            console.log(keys);
                            cbUser(null);
                        });
                    }, propagateError(cb));                
            }
        ], propagateError(cbMain));
    }

    async.series([
        printGroupMembers,
        printPublicKeys
    ], reportError);


    /*

    async.waterfall([
        // Find all groups
        function (cb) {
            connection.authz().resources(account, { kind: 'group' }, cb);
        },
        // Print group members
        function (groups, cb) {
            async.map(groups,
                function(group, vcb) {
                },
                function(err) {
                    if ( err ) return cb(err);

                    console.log("Public keys:");
                    console.log(values.join(""));
                    cb(null);
                });
        },
        function (user, cb) {
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
                    cb(null);
                });
        }        
    ],
    function(err) {
        if ( err )
            console.log(err);
    })
    */
});
