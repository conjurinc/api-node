var g = require('../global'),
  authn = require('./authn')
  ;

function parseId(id) {
  var tokens, account, kind, identifier;
  
  if ( id instanceof Array )
    tokens = id;
  else
    tokens = id.split(':')
  
  return {
    account: tokens[0],
    kind: tokens[1],
    identifier: tokens.slice(2, tokens.length)
  }
}

module.exports = {
  parseRoleId: parseId,
  parseResourceId: parseId,
  connect: function(url, token) {
    return {
      role: function(roleId) {
        roleId = module.exports.parseRoleId(roleId);
        
        return {
          // GET /:account/roles/:role_id?check&privilege=:privilege&resource_kind=:kind&resource_id=:id
          checkPermission: function(resourceId, permission, callback) {
            var username = g.username(token);
            var resourceId = module.exports.parseResourceId(resourceId);
            var path = g.format(url + '/%s/roles/%s/%s?check&privilege=%s&resource_account=%s&resource_kind=%s&resource_id=%s', roleId.account, g.pathEscape(roleId.kind), g.pathEscape(roleId.identifier), g.escape(permission), g.escape(resourceId.account), g.escape(resourceId.kind), g.escape(resourceId.identifier));
            g.log(g.format("GET %s", path));
            g.rest.get(path, { headers: { 'Authorization': authn.tokenHeader(token) } } )
              .on('complete', function(result, response) {
                if ( result instanceof Error)
                  return callback(result);
                  
                callback(null, response.statusCode === 204);
              }); 
          }
        }
      },
      resource: function(resourceId) {
        resourceId = module.exports.parseResourceId(resourceId);
        
        return {
          exists: function(callback) {
            var path = g.format(url + '/%s/resources/%s/%s', resourceId.account, g.escape(resourceId.kind), g.pathEscape(resourceId.identifier));
            g.log(g.format("HEAD %s", path));
            g.rest.head(path, { headers: { 'Authorization': authn.tokenHeader(token) } } )
              .on('complete', function(result, response) {
                if ( result instanceof Error)
                  return callback(result);
                  
                callback(null, response.statusCode === 200);
              }); 
          },
          // GET /:account/roles/allowed_to/:permission/:kind/*identifier List all roles that have a permission on a resource
          allowedTo: function(permission, callback) {
            var path = g.format(url + '/%s/roles/allowed_to/%s/%s/%s', resourceId.account, g.escape(permission), g.escape(resourceId.kind), g.pathEscape(resourceId.identifier));
            g.getURL(path, g.authorizationHeader(token), function(err, result) {
              if ( err)
                return callback(err);

              var roles = []
              result.forEach(function(result) {
                roles.push([ result['id']['account'], result['id']['id'] ].join(':'));
              });
              
              callback(null, roles);
            });
          }
        }
      }
    }
  }
}
