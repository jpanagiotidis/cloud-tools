'use strict';

const aws = require('aws-sdk');
const _ = require('lodash');
const SQSEntity = require('./entity.js').SQSEntity;

const ERROR_UNDEFINED_QUEUE = 'The queue URL is undefined';

class SQSProducer extends SQSEntity{
  constructor(queueURL, data) {
    super(queueURL, data);
  }

  publish(data, _queueURL) {
    let queueURL = _queueURL ? _queueURL : this.queueURL;
    if(!queueURL){
      return Promise.reject(new Error(ERROR_UNDEFINED_QUEUE));
    }

    let message = data;
    if(_.isObject(data)){
      message = JSON.stringify(data);
    }

    return this.sqs.sendMessage({
      "MessageBody": message,
      "QueueUrl": queueURL
    }).promise();
  }

  getRegion(){
    return this.sqs.config.region;
  }
}

module.exports = {
  SQSProducer,
}
