var g = require('../global'),
  authn = require('./authn')
  ;

module.exports = {
  parseResourceId: function(resourceId) {
    var resourceTokens, account, kind, identifier;
    
    if ( resourceId instanceof Array )
      resourceTokens = resourceId;
    else
      resourceTokens = resourceId.split(':')
    
    return {
      account: resourceTokens[0],
      kind: resourceTokens[1],
      identifier: resourceTokens.slice(2, resourceTokens.length)
    }
  },
  connect: function(url, token) {
    return {
      resource: function(resourceId) {
        resourceId = module.exports.parseResourceId(resourceId);
        
        return {
          exists: function(callback) {
            var path = g.format(url + '/%s/resources/%s/%s', resourceId.account, g.escape(resourceId.kind), g.pathEscape(resourceId.identifier));
            console.log(g.format("HEAD %s", path));
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
            console.log(g.format("GET %s", path));
            g.rest.get(path, { headers: { 'Authorization': authn.tokenHeader(token) } } )
              .on('complete', function(result, response) {
                if ( result instanceof Error)
                  return callback(result);
                else if ( response.statusCode !== 200 )
                  return callback(g.format("GET %s failed : %s", path, response.statusCode));
                  
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
