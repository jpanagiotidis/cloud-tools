'use strict';

const debug = require('../debug');
const getId = require('../id').getId;

const config = {
  SERVICE_NAME: undefined,
  INSTANCE_ID: undefined,
  ENVIRONMENT_NAME: undefined,
  KEYS: {
    TIME_STAMP: 'TIME_STAMP',
    ENVIRONMENT_NAME: 'ENVIRONMENT_NAME',
    INSTANCE_ID: 'INSTANCE_ID',
    MESSAGE: 'MESSAGE',
    TYPE: 'TYPE',
    ERROR_TYPE: 'ERROR_TYPE',
  },
  VALUES: {
    TYPE: {
      INFO: 'INFO',
      AUDIT: 'AUDIT',
      ERROR: 'ERROR',
    },
    ERROR_TYPE: {
      UNHANDLED_REJECTION: 'UNHANDLED_REJECTION',
      UNHANDLED_EXCEPTION: 'UNHANDLED_EXCEPTION',
      DEAD_LETTER_QUEUE_MESSAGE: 'DEAD_LETTER_QUEUE_MESSAGE',
      SYNTAX_ERROR: 'SYNTAX_ERROR',
      TYPE_ERROR: 'TYPE_ERROR',
    },
  },
  ERRORS: {
    MISSING_NAME_AND_ENV_ARGS: 'Service Name and Environment Name are mandatory arguments',
    NOT_INITIALIZED: 'Please initialize first by using the MessageUtils.init',
    UNDEFINED_ERROR_TYPE: 'The argument errorType is missing',
  },
  DEBUG: 'MessagesUtils',
};

function init(serviceName, environmentName) {
  if (!serviceName || !environmentName) {
    debug(config.DEBUG, `init: ERROR: ${config.ERRORS.MISSING_NAME_AND_ENV_ARGS}`);
    return Promise.reject(new Error(config.ERRORS.MISSING_NAME_AND_ENV_ARGS));
  }

  config.SERVICE_NAME = serviceName;
  config.ENVIRONMENT_NAME = environmentName;

  return new Promise((resolve, reject) => {
    getId(serviceName)
    .then((id) => {
      debug(config.DEBUG, `init: completed with INSTANCE_ID: ${id}`);
      config.INSTANCE_ID = id;
      resolve();
    })
    .catch((err) => {
      reject(err);
    });
  });
}

function isReady() {
  if (
    !config.SERVICE_NAME
    || !config.ENVIRONMENT_NAME
    || !config.INSTANCE_ID
  ) {
    return false;
  }

  return true;
}

function getConfig() {
  return config;
}

module.exports = {
  init,
  isReady,
  getConfig,
};
