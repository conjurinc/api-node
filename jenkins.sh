#!/bin/bash -ex

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

if [ -z $KEEP ]; then
  trap cleanup EXIT
fi


docker run --privileged -d -p 443:443 -v $PWD/integration:/app/integration --cidfile conjur-cid localhost:8080/conjur-appliance-cuke-master:4.7-stable

# wait_for_conjur expects conjur to resolve to the conjur appliance
docker exec $(cat conjur-cid) bash -c "echo '127.0.0.1 conjur' >> /etc/hosts"

docker exec $(cat conjur-cid) /opt/conjur/evoke/bin/wait_for_conjur

# Load the policy
docker exec $(cat conjur-cid) bash -c "CONJUR_AUTHN_LOGIN=admin \
                              CONJUR_AUTHN_API_KEY=secret \
                              conjur policy load \
                                 --context /app/integration/conjur.json \
                                 /app/integration/policy.yml"


conjur_ip=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $(cat conjur-cid))



docker run --rm \
    -e TEST_REPORTER=xunit-file \
    -e XUNIT_FILE=report/xunit.xml \
    -e CONJUR_APPLIANCE_HOSTNAME=$conjur_ip \
    -v $PWD/report:/app/report \
    -v $PWD/ci:/app/ci \
    api-node:$job \
    /app/ci/test.sh

echo "Test results are available in report/xunit.xml"
