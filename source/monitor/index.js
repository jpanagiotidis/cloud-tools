'use strict';

const messageUtils = require('../message-utils');
const CWLogs = require('../aws').cw.CWLogs;
const getId = require('../id').getId;
const getTimestamp = require('../date-utils').getTimestamp;

const errorTypes = messageUtils.getCommonErrorTypes();
let cwLog;
let initPromise;

function exceptionCb(err) {
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
    process.exit(1);
  });
}

function rejectionCb(err) {
  cwLog.putLogs([{
    timestamp: getTimestamp(),
    message: JSON.stringify(
      messageUtils.getError(
        errorTypes.UNHANDLED_EXCEPTION,
        {
          message: err.message,
          trace: err,
        }
      )
    ),
  }])
  .then(() => {
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
          process.on('unhandledException', exceptionCb);
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
