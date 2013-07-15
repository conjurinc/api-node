if [ ! -d integration/testdata ]; then
  echo "Generating test assets"
  ./integration/generate_assets.sh integration/testdata
fi
mocha --require testconfig --recursive -R xunit --compilers coffee:coffee-script test/ > test-result.xml
mocha --require testconfig --recursive -R xunit --compilers coffee:coffee-script integration/ > integration-result.xml
