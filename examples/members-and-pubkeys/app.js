var assert = require('assert'),
    conjur = require('conjur-api'),
    netrc = require('netrc'),
    url = require('url'),
    yaml = require('js-yaml'),
    fs = require('fs');

function main(endpoints, account, login, password, groupId) {
    conjur.authn
        .connect(endpoints.authn(account))
        .authenticate(login, password, function(result, token) {
            assert(token);

            conjur.group
                .connect(endpoints, token)
                .group(account, groupId)
                .members(function(err, result) {
                    assert(!err, conjur.global.inspect(err));
                    console.log('Members:', conjur.global.u.map(result, function(r){ return r.member; }));
                    console.log();

                    result.forEach(function(g) {
                        var member = g.member.split(':')[2];

                        if (g.member.split(':')[1] !== 'user') {
                            console.log(g.member, 'is not a user');
                            return;
                        }

                        conjur.pubkeys
                            .connect(endpoints, token)
                            .show(account, member, function(err, result) {
                                assert(!err, conjur.global.inspect(err));

                                console.log('Public keys for %s:', member, result);
                            });
                    });
                });
        });
}

if (require.main === module) {
		var groupId = process.argv[2];
		assert(groupId);
	
    // Read settings from ~/.conjurrc file
    // then generate url from `appliance_url` and
    // read login and password from ~/.netrc file

    var filename = process.env.CONJURRC || process.env.HOME + '/.conjurrc';
    
    console.log("Loading Conjur configuration from %s. Set CONJURRC env to use a different file", filename);

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
    
    var applianceURL = settings['appliance_url'];
    var baseUrl = url.parse(applianceURL);
    baseUrl = baseUrl.protocol + '//' + baseUrl.host + '/';

    var machine = baseUrl + 'api/authn',
        login = netrc()[machine].login,
        password = netrc()[machine].password,
        account = settings['account'];

    console.log('=========================================================================');
    console.log('Appliance url:', applianceURL);
    console.log('Base url:', baseUrl);
    console.log('Machine url:', machine);
    console.log('Account:', account);
    console.log('Login:', login);
    console.log('Password:', password);
    console.log('=========================================================================');
    console.log();

    // Trust the Conjur certificate file for TLS
    // (otherwise you'll get a TLS_REJECT_UNAUTHORIZED error)
    var opts = require('https').globalAgent.options;
    opts.ca = fs.readFileSync(settings['cert_file'], 'utf8');

    var endpoints = conjur.config.applianceEndpoints(applianceURL, account)
    
    main(endpoints, account, login, password, groupId);
}
