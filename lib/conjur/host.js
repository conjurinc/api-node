var g = require('../global'),
  authn = require('./authn')
  authz = require('./authz')
  ;
  
module.exports = {
  connect: function(endpoints) {
    var Host = function(account, hostname, token) {
      this.account = account;
      this.hostname = hostname;
      this.token = token;
      
      this.__defineGetter__("currentRole", function() {
        return g.currentRole(this.account, this.token);
      })
    }
    
    /**
     * Check if the host is visible to the current user.
     */
    Host.prototype.visibleTo = function(callback) {
      // Shortcut if the bound user is this host
      if ( this.currentRole === g.format('%s:%s:%s', this.account, 'host', this.hostname) )
        callback(null, true);
      else {
        this.rolesWithAccessTo(function(err, result) {
          if ( err ) return callback(err);
          
          callback(null, g.u.keys(result).indexOf(this.currentRole) !== -1);
        }.bind(this));
      }
    },
    /*
     * Ensure that the authenticated user is either the host itself, or has
     * some permission to the host.
     */
    Host.prototype.verifyVisibleTo = function(callback) {
      this.visibleTo(function(err, result) {
        if ( err )
          callback(err);
        else if ( !result )
          callback(g.format("Host %s is not visible to %s", this.hostname, this.token['data']));
        else
          callback(null);
      }.bind(this))
    }
    
    /**
     * Gets a mapping from roles to permission lists. Each permission list is 'execute', 'update', or both. 
     */
    Host.prototype.rolesWithAccessTo = function(callback) {
      var result = { };
      
      g.async.map([ 'execute', 'update' ],
        function(permission, cb) {
          authz.connect(endpoints.authz(this.account), this.token).resource([ this.account, 'host', this.hostname ]).allowedTo(permission, function(err, roles) {
            if ( err ) return cb(err);
            
            roles.forEach(function(role) {
              if ( !result[role] )
                result[role] = [];
              result[role].push(permission);
            });
            
            cb(null);
          });
        }.bind(this),
        function(err) {
          if ( err ) return callback(err);
          
          callback(null, result);
        });
    }

    return {
      host: function(account, hostname, token) {
        return new Host(account, hostname, token);
      }
    }
  }
}
