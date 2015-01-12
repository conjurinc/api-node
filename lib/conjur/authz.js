/*
 * Copyright (C) 2013 Conjur Inc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var g = require('../global'),
    authn = require('./authn');

function parseId(id) {
  var tokens, account, kind, identifier;

  if (id instanceof Array) {
    tokens = id;
  } else {
    tokens = id.split(':');
  }

  return {
    account: tokens[0],
    kind: tokens[1],
    identifier: tokens.slice(2, tokens.length)
  };
}

function flattenId(id) {
  if (id instanceof Array)
    return id.join(":")
  else
    return id
}

module.exports = {
  parseRoleId: parseId,
  parseResourceId: parseId,
  connect: function(url, token) {
    return {
    	/**
    	 * Lists resources. 
    	 * 
    	 * Options, which are all optional:
    	 * 
    	 * * kind: restrict by kind
    	 * * search: apply full-text search
    	 * * offset: index of the first result
    	 * * limit: restrict the number of results
    	 * * owner: resource owner
    	 */
    	resources: function(account, options, callback) {
    		if ( g.u.isFunction(options) && callback === undefined ) {
    			callback = options;
    			options = {};
    		}
    		
    		var path;
    		if ( options.kind )
          path = g.format(url + '/%s/resources/%s', 
          		account, 
          		g.pathEscape(options.kind));
    		else
          path = g.format(url + '/%s/resources', account);
        delete options['kind']
        
        if ( g.u.size(options) > 0 ) {
          var query = g.u.map(options, function(v,k) { g.format("%s=%s", k, encodeURIComponent(v)) } ).join("&")
    			path = g.format("%s?%s", path, query)
    		}

				g.getURL(path, g.authorizationHeader(token), callback);
    	},
    	
      role: function(roleId) {
        roleId = module.exports.parseRoleId(roleId);

        return {
        	members: function(callback) {
            var path = g.format(url + '/%s/roles/%s/%s?members', 
            		roleId.account, 
            		g.pathEscape(roleId.kind), 
            		g.pathEscape(roleId.identifier));
						
						g.getURL(path, g.authorizationHeader(token), function(err, members) {
							if ( err)
								return callback(err);
							return callback(null, members);
						});
        	},
        	
          memberships: function(callback) {
            var path = g.format(url + '/%s/roles/%s/%s?all', 
            		roleId.account, 
            		g.pathEscape(roleId.kind), 
            		g.pathEscape(roleId.identifier));
            g.getURL(path, g.authorizationHeader(token), function(err, role_ids) {
              if ( err)
                return callback(null,[]);   // just empty list of roles
              callback(null, role_ids);
            });
          },
          
          // GET /:account/roles/:role_id?check&privilege=:privilegere&source_id=:id
          checkPermission: function(resourceId, privilege, callback) {
            var username = g.username(token);
            var path = g.format(url + '/%s/roles/%s/%s?check&privilege=%s&resource_id=%s', roleId.account, g.pathEscape(roleId.kind), g.pathEscape(roleId.identifier), g.escape(privilege), g.escape(flattenId(resourceId)));
            g.info(g.format("GET %s", path));
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
            g.info(g.format("HEAD %s", path));
            g.rest.head(path, { headers: { 'Authorization': authn.tokenHeader(token) } } )
              .on('complete', function(result, response) {
                if ( result instanceof Error)
                  return callback(result);

                callback(null, response.statusCode === 200);
              });
          },
          // GET /:account/roles/allowed_to/:privilege/:kind/*identifier List all roles that have a privilege on a resource
          allowedTo: function(privilege, callback) {
            var path = g.format(url + '/%s/roles/allowed_to/%s/%s/%s', resourceId.account, g.escape(privilege), g.escape(resourceId.kind), g.pathEscape(resourceId.identifier));
            g.getURL(path, g.authorizationHeader(token), function(err, role_ids) {
              if ( err)
                return callback(err);
              callback(null, role_ids);
            });
          },
          // GET /:account/resources/:kind/:id?check&privilege=:privilege
          checkPermission: function(privilege, callback) {
            var path = g.format(url + '/%s/resources/%s/%s?check&privilege=%s', resourceId.account, g.pathEscape(resourceId.kind), g.pathEscape(resourceId.identifier), g.escape(privilege));
            g.info(g.format("GET %s", path));
            g.rest.get(path, { headers: { 'Authorization': authn.tokenHeader(token) } } )
              .on('complete', function(result, response) {
                if ( result instanceof Error)
                  return callback(result);

                callback(null, response.statusCode === 204);
              });
          }
        }
      }
    }
  }
}
