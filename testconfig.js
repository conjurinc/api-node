"use strict";

var winston = require('winston');

module.exports = function(){
    try {
        winston.remove(winston.transports.Console);
    }catch(e){
        return;
    }
    winston.add(winston.transports.File, {filename: 'test.log', level: 'debug'});
};
