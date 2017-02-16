'use strict';

const init = require('./config.js').init;
const isReady = require('./config.js').isReady;
const getError = require('./error.js').getError;

module.exports = {
  init,
  isReady,
  getError,
};
