# Conjur API for Node.js

# Testing

* Install global dependencies

    $ sudo npm install -g mocha coffee-script

* Load the test data set

    $ cd integration
    $ conjur policy load -c policy.json policy.rb

* Run the tests

    $ test.sh
