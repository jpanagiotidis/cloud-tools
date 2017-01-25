'use strict';

const SQSProducer = require('./producer').SQSProducer;
const SQSConsumer = require('./consumer').SQSConsumer;

module.exports = {
  SQSProducer,
  SQSConsumer,
};
