#!/bin/bash

if [ $TEST_DEV ] ; then
    ./node_modules/mocha/bin/mocha --require testconfig --recursive --compilers coffee:coffee-script/register test/
else
    ./node_modules/mocha/bin/mocha --require testconfig --recursive -R xunit --compilers coffee:coffee-script/register test/ > test-result.xml
# ./node_modules/mocha/bin/mocha --require testconfig --recursive -R xunit --compilers coffee:coffee-script/register integration/ > integration-result.xml
fi