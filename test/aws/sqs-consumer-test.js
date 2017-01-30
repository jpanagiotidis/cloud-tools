'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const stubs = require('./stubs.js');
const sqs = require('../../source/aws/sqs/consumer.js');

const SQSConsumer = sqs.SQSConsumer;

describe('SQSConsumer Tests', function() {
  it('has a SQSConsumer constructor' function() {
    expect(SQSConsumer).to.be.a('function');
    const cnsm = new SQSConsumer();
    expect(cnsm).to.be.an('object');
  });
});
