'use strict';

const config = require('../config.js').services;
const aws = require('aws-sdk');

class SQSEntity {
  constructor(queueURL, data) {
    this.sqs = new aws.SQS(Object.assign(
      {},
      config.SQS,
      data,
      {
        apiVersion: config.SQS.apiVersion,
      }
    ));

    this.queueURL = queueURL;
  }
}

module.exports = {
  SQSEntity,
};
