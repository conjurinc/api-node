#!/bin/bash
set -e

[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"

rvm use 1.9.3@conjur-cli-ci

# Bootstrap
WORKDIR=$1

if [ -z "$WORKDIR" ] ; then
    echo "Usage: $0 <target_directory>"
    exit 1
else
    echo "Generating new assets, info stored in $WORKDIR"
    if [ ! -d $WORKDIR ] ; then
        mkdir -v $WORKDIR
    fi
fi

cd $WORKDIR

# Preliminary setup
ns=`conjur id:create | tee ns`

CONJURAPI_LOG=stderr conjur user:create $ns-admin --no-password > admin.json
CONJURAPI_LOG=stderr conjur group:create $ns/admin >/dev/null
CONJURAPI_LOG=stderr conjur group:members:add $ns/admin user:$ns-admin
