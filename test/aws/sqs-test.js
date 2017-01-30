'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const aws = require('aws-sdk');
const stubs = require('./stubs.js');
const SQSStub = stubs.SQSStub;
const SQSErrorStub = stubs.SQSErrorStub;
const sqs = require('../../source/aws/sqs/producer.js');
const errorMsg = sqs.ERROR_UNDEFINED_QUEUE;
const SQSProducer = sqs.SQSProducer;

const dummyQueue = 'dummyQueue';
const dummyString = 'some string';
const dummyObject = {
  someKey: 'abc',
  other: 10,
};
const dummyRegion = 'dummy-region';

describe('AWS SQS Tests Suite', function(){
  describe('SQSProducer Tests', function() {
    it('has a SQSProducer class', function() {
      expect(SQSProducer).to.be.a('function');
      const prod = new SQSProducer();
      expect(prod).to.be.an('object');
    });

    it('has a publish method', function() {
      const prod = new SQSProducer();
      expect(prod.publish).to.be.a('function');
    });

    it('calls the sqs sendMessage with correct arguments', sinon.test(function(done) {
      const stub = this.stub(aws, 'SQS', SQSStub);
      const spy = this.spy(SQSStub.prototype, 'sendMessage');
      const prod = new SQSProducer(dummyQueue);
      prod.publish(dummyString)
      .then(res => {
        expect(spy).to.have.property('calledOnce', true);
        expect(spy.args[0][0]).to.have.property('MessageBody', dummyString)
        expect(spy.args[0][0]).to.have.property('QueueUrl', dummyQueue);
        done();
      })
      .catch(done);
    }));

    it('if sqs sendMessage fails the error is propagated', sinon.test(function(done) {
      const stub = this.stub(aws, 'SQS', SQSErrorStub);
      const spy = this.spy(SQSErrorStub.prototype, 'sendMessage');
      const prod = new SQSProducer(dummyQueue);
      prod.publish(dummyString)
      .then(res => {
        done('It should be rejected');
      })
      .catch(err => {
        expect(err).to.have.property('message', 'The request has failed due to a temporary failure of the server.');
        expect(err).to.have.property('code', 'AWS.SimpleQueueService.ServiceUnavailable');
        expect(err).to.have.property('status', 503);
        done()
      });
    }));

    it('supports json messages', sinon.test(function(done) {
      const stub = this.stub(aws, 'SQS', SQSStub);
      const spy = this.spy(SQSStub.prototype, 'sendMessage');
      const prod = new SQSProducer(dummyQueue);
      prod.publish(dummyObject)
      .then(res => {
        expect(spy).to.have.property('calledOnce', true);
        expect(spy.args[0][0]).to.have.property('MessageBody', JSON.stringify(dummyObject))
        expect(spy.args[0][0]).to.have.property('QueueUrl', dummyQueue);
        done();
      })
      .catch(done);
    }));

    it('if no queue is defined the publish is rejected', function(done) {
      const prod = new SQSProducer();
      prod.publish(dummyString)
      .then(() => {
        done('This should be rejected');
      })
      .catch((err) => {
        expect(err.message).to.be.equal(errorMsg);
        done();
      })
    });

    it('has a getRegion method', function() {
      const prod = new SQSProducer();
      expect(prod.getRegion).to.be.a('function');
    });

    it('it returns the sqs region', function() {
      const prod = new SQSProducer(dummyQueue, {
        region: dummyRegion,
      });

      expect(prod.getRegion()).to.be.equal(dummyRegion);
    });
  });
});
