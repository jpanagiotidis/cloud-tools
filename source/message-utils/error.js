'use strict';

const getBase = require('./base.js').getLogTemplate;
const config = require('./config.js').getConfig();

const KEYS = config.KEYS;
const VALUES = config.VALUES;

function getError(errorType, data) {
  const base = getBase();
  if (!errorType) {
    throw new Error(config.ERRORS.UNDEFINED_ERROR_TYPE);
  }

  const errorAttrs = {};
  errorAttrs[KEYS.TYPE] = VALUES.TYPE.ERROR;
  errorAttrs[KEYS.ERROR_TYPE] = errorType;
  errorAttrs[KEYS.MESSAGE] = data;

  return Object.assign(
    {},
    base,
    errorAttrs
  );
}

function getCommonErrorTypes() {
  return config.VALUES.ERROR_TYPE;
}

module.exports = {
  getError,
  getCommonErrorTypes,
};
