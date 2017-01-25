'use strict';

const aws = require('aws-sdk');
const _ = require('lodash');
const SQSEntity = require('./entity.js').SQSEntity;

class SQSConsumer extends SQSEntity{
  constructor(queueURL, data, handler, errorHandler) {
    super(queueURL, data);
    this.handler = handler;
    this.errorHandler = errorHandler;
  }

  start(){
    this.isPolling = true;
    this.step();
  }

  stop(){
    this.isPolling = false;
  }

  step(){
    if(this.isPolling){
      this.fetchMessages();
    }
  }

  fetchMessages(){
    let messages;
    this.sqs.receiveMessage({
      "QueueUrl": this.queueURL,
      "MaxNumberOfMessages": 10,
      "WaitTimeSeconds": 20,
    }).promise()
    .then((res) => {
      messages = res.Messages ? res.Messages : [];
      return Promise.resolve(messages);
    })
    .then(this.handler)
    .then((res) => {
      return Promise.resolve(res && _.isArray(res) ? res : messages);
    })
    .then(this.batchDelete.bind(this))
    .then(this.step.bind(this))
    .catch(this.errorHandler);
  }

  batchDelete(messages){
    if(_.isArray(messages) && messages.length > 0){
      messages = messages.map((m) => ({
        'Id': m.MessageId,
        'ReceiptHandle': m.ReceiptHandle,
      }));
      return this.sqs.deleteMessageBatch({
        Entries: messages,
        QueueUrl: this.queueURL,
      }).promise();
    }
  }
}

module.exports = {
  SQSConsumer,
};
