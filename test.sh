#!/bin/bash -ex

rm -rf reports
npm install
node node_modules/gulp/bin/gulp.js jenkins
