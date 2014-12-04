Simple example which shows how to:

1. Load and parse a `~/.conjurrc` configuration
2. Extract login and api key from `~/.netrc`
3. Connect to Conjur and authenticate, exchanging the API key for a bearer token
4. Call the API to list the members of a group
5. Distinguish users from other types of group members (such as other groups)
6. Enumerate the public keys for each user in the group
