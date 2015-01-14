# Conjur API for Node.js

# Testing

* Install global dependencies
```
    $ sudo npm install -g mocha coffee-script gulp
```

* Load the test data set
```
    $ cd integration
    $ conjur policy load -c policy.json policy.rb
```

* Configure gulp reporting (optional)
```
    # To write reports to a file in xunit format
    $ export TEST_REPORTER=xunit-file
    $ export XUNIT_FILE=reports/report.xml
```

* Run jslint and tests
```
    $ gulp
```

