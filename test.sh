#!/bin/bash -ex

rm -rf reports
node node_modules/gulp/bin/gulp.js jenkins
