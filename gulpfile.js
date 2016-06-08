/*
 * Copyright (C) 2013 Conjur Inc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

"use strict";

var gulp    = require('gulp'),
    jslint  = require('gulp-jslint'),
    mocha   = require('gulp-mocha'),
    silenceLogger = require('./testconfig');

require('coffee-script/register');

var sources = ['lib/**/*.js'];
var tests   = ['test/**/*_test.coffee'];
var features = ['integration/**/*_test.coffee'];


function chooseMochaReporter(){
    // if TEST_REPORTER is set, use that
    if(process.env['TEST_REPORTER']){
        return process.env['TEST_REPORTER'];
    }

    if(process.stdout.isTTY){
        // use the always popular nyancat reporter if we're
        // in someones terminal
        return 'nyan';
    }
    // spec is a useful format, and looks good whether or not you're
    // in a terminal.
    return 'spec';
}

function isJenkins(){
    return process.env.hasOwnProperty('JENKINS_HOME');
}

function mochaTimeout(){
    if(isJenkins()){
        return 30000; // 30 seconds, because we HATESES TIMEOUT FAILURES
    }else{
        return 2000; // default 2 seconds
    }
}



var mochaOpts = {
    reporter: chooseMochaReporter(),
    timeout: mochaTimeout()
};


var jslintOpts = {
    // assume node.js
    node: true,
    // don't worry about sloppy whitespace
    white: true,
    // this one makes regexps of any kind impossible to use,
    // for example it calls "." insecure, as well as "^", even
    // when using it in a character class like "[^foo]".
    regexp: true,
    // This one makes maintaining backwards compatibility more or less impossible.
    // See the xyzUrl functions in lib/config.js
    unparam: true,
    // don't print successes
    errorsOnly: true
};


gulp.task('lint', function(){
    return gulp.src(sources)
        .pipe(jslint(jslintOpts));
});

gulp.task('test', function(){
    silenceLogger();
    return gulp.src(tests, {read: false})
        .pipe(mocha(mochaOpts));
});

gulp.task('features', function(){
    silenceLogger();
    return gulp.src(features, {read: false})
        .pipe(mocha(mochaOpts));
});

gulp.task('default', ['lint', 'test']);

// do this as a separate function to keep it from writing twice to xunit results
gulp.task('jenkins', function(){
    silenceLogger();
    return gulp.src(tests.concat(features), {read: false})
        .pipe(mocha(mochaOpts));
});

gulp.task('watch', function(){
    gulp.watch(['lib/**/*.js', 'test/**/*.coffee', 'gulpfile.js'], ['default']);
});
