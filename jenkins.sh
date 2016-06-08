#!/bin/bash -e

job=$JOB_NAME
if [ -z $job ]; then
	job=sandbox
fi

docker build -t api-node:$job .

rm -rf report
mkdir report

function cleanup(){
   docker rm -f $(cat conjur-cid)
   rm conjur-cid
}

trap cleanup EXIT

docker run -d -p 443:443 --cidfile conjur-cid registry.tld/conjur-appliance-cuke-master:4.7-stable

docker exec $(cat conjur-cid) wait_for_conjur

docker run --rm -e TEST_REPORTER=xunit-file -e XUNIT_FILE=report/xunit.xml -v $PWD/report:/app/report api-node:$job node node_modules/gulp/bin/gulp.js

echo "Test results are available in report/xunit.xml"
