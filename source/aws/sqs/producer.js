'use strict';

const FAKE = require('../config.js').other.FAKE;
const _ = require('lodash');
const debug = require('../../debug');
const SQSEntity = require('./entity.js').SQSEntity;

const debugName = 'SQSProducer';
const ERROR_UNDEFINED_QUEUE = 'The queue URL is undefined';

class SQSProducer extends SQSEntity {
  publish(data, _queueURL) {
    const queueURL = _queueURL || this.queueURL;
    if (!queueURL) {
      return Promise.reject(new Error(ERROR_UNDEFINED_QUEUE));
    }

    let message = data;
    if (_.isObject(data)) {
      message = JSON.stringify(data);
    }

    if (FAKE) {
      debug(debugName, 'fake publish message:', message, 'to queue', queueURL);
      return Promise.resolve();
    }

    debug(debugName, 'aws publish message:', message, 'to queue', queueURL);
    return this.sqs.sendMessage({
      MessageBody: message,
      QueueUrl: queueURL,
    }).promise();
  }

  getRegion() {
    return this.sqs.config.region;
  }

  setRegion(region) {
    this.sqs.config.update({
      region,
    });
  }
}

module.exports = {
  ERROR_UNDEFINED_QUEUE,
  SQSProducer,
};
