'use strict';

const config = require('../config.js').services.SQS;
const aws = require('aws-sdk');

class SQSEntity {
  constructor(queueURL, data) {
    this.sqs = new aws.SQS(Object.assign(
      {},
      config,
      data,
      {
        apiVersion: config.apiVersion,
      }
    ));

    this.queueURL = queueURL;
  }
}

module.exports = {
  SQSEntity,
};
