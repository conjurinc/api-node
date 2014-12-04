#!/bin/bash

mocha --require testconfig --recursive -R xunit --compilers coffee:coffee-script/register test/ > test-result.xml
mocha --require testconfig --recursive -R xunit --compilers coffee:coffee-script/register integration/ > integration-result.xml
