#!/bin/bash

if [ -z "$CONJUR_APPLIANCE_HOSTNAME" ] ; then
  echo "No CONJUR_APPLIANCE_HOSTNAME in environment!"
  exit 1
fi

echo "$CONJUR_APPLIANCE_HOSTNAME conjur" >> /etc/hosts

node node_modules/gulp/bin/gulp.js jenkins



