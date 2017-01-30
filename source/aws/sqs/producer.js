'use strict';

const _ = require('lodash');
const SQSEntity = require('./entity.js').SQSEntity;

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

    return this.sqs.sendMessage({
      MessageBody: message,
      QueueUrl: queueURL,
    }).promise();
  }

  getRegion() {
    return this.sqs.config.region;
  }
}

module.exports = {
  ERROR_UNDEFINED_QUEUE,
  SQSProducer,
};
