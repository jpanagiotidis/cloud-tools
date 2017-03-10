'use strict';

const messageUtils = require('../message-utils');
const SQSProducer = require('../aws').sqs.SQSProducer;
const debug = require('../debug');

const debugName = 'Monitor';
const errorTypes = messageUtils.getCommonErrorTypes();
let initPromise;
let sqs;

function exceptionCb(err) {
  debug(debugName, 'exceptionCb: uncaughtException', err.message, err.stack);
  debug(debugName, 'exceptionCb: sending log to cw');
  sqs.publish(messageUtils.getError(
    errorTypes.UNCAUGHT_EXCEPTION,
    {
      message: err.message,
      trace: err,
    }
  ))
  .then(() => {
    debug(debugName, 'exceptionCb: stoping the application', err.message);
    process.exit(1);
  })
  .catch((e) => {
    debug(debugName, 'ERROR exceptionCb:', e.message, 'stoping the application', err.message);
    process.exit(1);
  });
}

function rejectionCb(err) {
  debug(debugName, 'rejectionCb: unhandledRejection', err.message, err.stack);
  debug(debugName, 'rejectionCb: sending log to cw');
  sqs.publish(messageUtils.getError(
    errorTypes.UNHANDLED_REJECTION,
    {
      message: err.message,
      trace: err,
    }
  ))
  .then(() => {
    debug(debugName, 'rejectionCb: stoping the application', err.message);
    process.exit(1);
  })
  .catch((e) => {
    debug(debugName, 'ERROR exceptionCb:', e.message, 'stoping the application', err.message);
    process.exit(1);
  });
}

function init(serviceName, environmentName, queueURL) {
  if (!initPromise) {
    initPromise = messageUtils.init(serviceName, environmentName)
    .then(() => {
      sqs = new SQSProducer(queueURL);
      process.on('uncaughtException', exceptionCb);
      process.on('unhandledRejection', rejectionCb);
      return Promise.resolve('Monitoring of unhandled errors/rejections is ready');
    })
    .catch((err) => {
      console.log('ERROR', err); // eslint-disable-line no-console
    });
  }

  return initPromise;
}

module.exports = {
  init,
  exceptionCb,
  rejectionCb,
};
