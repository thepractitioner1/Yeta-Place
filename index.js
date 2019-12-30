const express = require('express');
const winston = require("winston");
const app = express();

require('./startup/db')();
require('./startup/config')();
require('./startup/logging')();




const port = process.env.PORT || 3000;

const server = app.listen(port, () => winston.info(`Listening on port ${port} `));

module.exports = server;