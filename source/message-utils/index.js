'use strict';

const init = require('./config.js').init;
const isReady = require('./config.js').isReady;
const getError = require('./error.js').getError;
const getCommonErrorTypes = require('./error.js').getCommonErrorTypes;

module.exports = {
  init,
  isReady,
  getError,
  getCommonErrorTypes,
};
