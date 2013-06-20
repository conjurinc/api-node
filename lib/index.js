module.exports = {
  authn: require('./conjur/authn'),
  authz: require('./conjur/authz'),
  config: require('./conjur/config'),
  directory: require('./conjur/directory'),
  host: require('./conjur/host'),
  user: require('./conjur/user'),
  environment: require('./conjur/environment'),
  global: require('./global')
}
