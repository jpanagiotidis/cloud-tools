'use strict';

const messageUtils = require('../message-utils');
const CWLogs = require('../aws').cw.CWLogs;
const getId = require('../id').getId;
const debug = require('../debug');
const getTimestamp = require('../date-utils').getTimestamp;

const debugName = 'Monitor';
const errorTypes = messageUtils.getCommonErrorTypes();
let cwLog;
let initPromise;

function exceptionCb(err) {
  debug(debugName, `exceptionCb: uncaughtException ${err.message}`);
  debug(debugName, 'exceptionCb: sending log to cw');
  cwLog.putLogs([{
    timestamp: getTimestamp(),
    message: JSON.stringify(
      messageUtils.getError(
        errorTypes.UNCAUGHT_EXCEPTION,
        {
          message: err.message,
          trace: err,
        }
      )
    ),
  }])
  .then(() => {
    debug(debugName, 'exceptionCb: stoping the application');
    process.exit(1);
  });
}

function rejectionCb(err) {
  debug(debugName, `rejectionCb: unhandledRejection ${err.message}`);
  debug(debugName, 'rejectionCb: sending log to cw');
  cwLog.putLogs([{
    timestamp: getTimestamp(),
    message: JSON.stringify(
      messageUtils.getError(
        errorTypes.UNHANDLED_REJECTION,
        {
          message: err.message,
          trace: err,
        }
      )
    ),
  }])
  .then(() => {
    debug(debugName, 'rejectionCb: stoping the application');
    process.exit(1);
  });
}

function init(serviceName, environmentName) {
  if (!initPromise) {
    initPromise = messageUtils.init(serviceName, environmentName)
    .then(() => (getId(serviceName)))
    .then((id) => {
      cwLog = new CWLogs(environmentName, id);
      return cwLog.init();
    })
    .then(() => (
      new Promise((resolve, reject) => {
        try {
          process.on('uncaughtException', exceptionCb);
          process.on('unhandledRejection', rejectionCb);
        } catch (e) {
          reject(e);
        }
        resolve('Monitoring of unhandled errors/rejections is ready');
      })
    ))
    .catch((err) => {
      console.log('ERROR', err);
    });
  }

  return initPromise;
}

module.exports = {
  init,
  exceptionCb,
  rejectionCb,
};
