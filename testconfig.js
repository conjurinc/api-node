var winston = require('winston')
  ;

winston.remove(winston.transports.Console);
winston.add(winston.transports.File, {filename: 'test.log', level: 'debug'})
