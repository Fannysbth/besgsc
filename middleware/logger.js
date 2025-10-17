const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create a write stream for logging
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '../logs/access.log'),
  { flags: 'a' }
);

const logger = morgan('combined', {
  stream: accessLogStream,
  skip: (req, res) => process.env.NODE_ENV === 'test'
});

const consoleLogger = morgan('dev');

module.exports = { logger, consoleLogger };