var u = require('underscore'),
	g = require('../lib/global')
	authn = require('../lib/conjur/authn')
	;

var policy     = JSON.parse(require('fs').readFileSync('./integration/policy.json'));
var adminId = u.find(u.keys(policy['api_keys']), function(id) {
	return id.match('admin');
})
var adminLogin = adminId.split(':')[2];
var adminKey   = policy['api_keys'][adminId];

g.assert(adminLogin)
g.assert(adminKey)

module.exports = {
	policy: policy,
	resourceNamespace: policy['policy'],
	userNamespace: policy['policy'].replace(/[@\.\/]/g, '-'),
	adminLogin: adminLogin,
	adminKey: adminKey,
	authenticate: function(cb) {
	  authn.connect('https://authn-ci-conjur.herokuapp.com').authenticate(adminLogin, adminKey, cb);
	}
}
