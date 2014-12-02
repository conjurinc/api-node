var assert = require('assert'),
    conjur = require('conjur-api'),
    netrc = require('netrc'),
    url = require('url'),
    yaml = require('js-yaml'),
    fs = require('fs');

function main(baseUrl, account, login, password) {
    var infoUrl = baseUrl + 'api/info',
        authnUrl = baseUrl + 'api/authn',
        authzUrl = baseUrl + 'api/authz',
        pubkeysUrl = baseUrl + 'api/pubkeys';

    conjur.authn
        .connect(authnUrl)
        .authenticate(login, password, function(result, token) {
            assert(token);

            var groupId = [account, 'group', 'build-0.1.0/ha-managers'];

            conjur.authz
                .connect(authzUrl, token)
                .group(groupId)
                .members
                .list(function(err, result) {
                    assert(!err, conjur.global.inspect(err));
                    console.log('Groups:', result);
                    console.log();

                    result.forEach(function(g) {
                        var member = g.member.split(':')[2];

                        if (g.member.split(':')[1] !== 'user') {
                            console.log(g.member, 'not a user');
                            return;
                        }

                        conjur.pubkeys
                            .connect(pubkeysUrl, token)
                            .show(g.member, function(err, result) {
                                assert(!err, conjur.global.inspect(err));

                                console.log('Pubkey:', result);
                            });
                    });
                });
        });
}

if (require.main === module) {
    // Read settings from ~/.conjurrc file
    // then generate url from `appliance_url` and
    // read login and password from ~/.netrc file

    var filename = process.env.HOME + '/.conjurrc';

    if (!fs.existsSync(filename)) {
        console.log('File does not exist: ' + filename);
        process.exit(1);
    }

    try {
        var settings = yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
    } catch (e) {
        console.log('Can`t load conjurrc file: ' + e);
        process.exit(1);
    }

    var baseUrl = url.parse(settings['appliance_url']);
    baseUrl = baseUrl.protocol + '//' + baseUrl.host + '/';

    var machine = baseUrl + 'api/authn',
        login = netrc()[machine].login,
        password = netrc()[machine].password,
        account = settings['account'];

    console.log('=========================================================================');
    console.log('Appliance url:', settings['appliance_url']);
    console.log('Base url:', baseUrl);
    console.log('Machine url:', machine);
    console.log('Account:', account);
    console.log('Login:', login);
    console.log('Password:', password);
    console.log('=========================================================================');
    console.log();

    // Don't forget to inject CERT file for TLS
    // (otherwise get the TLS_REJECT_UNAUTHORIZED error
    var opts = require('https').globalAgent.options;
    opts.ca = fs.readFileSync(settings['cert_file'], 'utf8');

    main(baseUrl, account, login, password);
}
