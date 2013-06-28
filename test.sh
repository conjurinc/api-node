mocha --require testconfig --recursive -R xunit --compilers coffee:coffee-script test/ > test-result.xml
mocha --require testconfig --recursive -R xunit --compilers coffee:coffee-script integration/ > integration-result.xml
