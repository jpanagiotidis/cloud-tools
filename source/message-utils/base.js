'use strict';

const isReady = require('./config.js').isReady;
const config = require('./config.js').getConfig();
const KEYS = require('./config.js').getConfig().KEYS;
const getTimestamp = require('../date-utils').getTimestamp;


function getLogTemplate() {
  if (!isReady()) {
    throw new Error(config.ERRORS.NOT_INITIALIZED);
  }

  const out = {};
  out[KEYS.TIME_STAMP] = getTimestamp();
  out[KEYS.ENVIRONMENT_NAME] = config.ENVIRONMENT_NAME;
  out[KEYS.INSTANCE_ID] = config.INSTANCE_ID;

  return out;
}

module.exports = {
  getLogTemplate,
};
