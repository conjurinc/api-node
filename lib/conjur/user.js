var g = require('../global')
  , authn = require('./authn')
  , dir = require('./directory')
  ;

function tokenizeRole(role) {
  return role instanceof Array ? role : role.split(':');
}

function selectRoleKind(roles, kind) {
  return g.u.filter(roles, function(role) {
    var tokens = tokenizeRole(role);
    return tokens[1] && tokens[1] === kind;
  })
}

function selectRoleId(roles) {
  return g.u.map(roles, function(role) {
    var tokens = tokenizeRole(role);
    return tokens.slice(2, tokens.length).join(':');
  })
}
      
module.exports = {
  selectRoleKind: selectRoleKind,
  selectRoleId: selectRoleId,
  connect: function(endpoints, token) {
    var User = function(account, username) {
      this.account = account;
      this.username = username;
    }
    
    /**
     * Authenticate the credentials using the authn service.
     */
    User.prototype.authenticate = function(password, callback) {
      authn.connect(endpoints.authn(this.account)).authenticate(this.username, password, callback);
    }

    return {
      users: function(account, token) {
        return {
          uidnumbers: function(logins, callback) {
            dir.connect(endpoints.directory(account), token).uidnumbers(logins, callback);
          }
        }
      },
      user: function(account, username) {
        return new User(account, username);
      }
    }
  }
}
