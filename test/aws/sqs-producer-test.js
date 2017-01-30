'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const aws = require('aws-sdk');
const stubs = require('./stubs.js');
const AWSStubGenerator = stubs.AWSStubGenerator;
const sqs = require('../../source/aws/sqs/producer.js');
const errorMsg = sqs.ERROR_UNDEFINED_QUEUE;
const SQSProducer = sqs.SQSProducer;

const sqsStub = AWSStubGenerator({
  promises: [
    {
      name: 'sendMessage',
      callback: msg => (
        Promise.resolve({
          ResponseMetadata: {
            RequestId: 'f56a95a1-9c9a-5e1b-9528-c55c436c242f'
          },
          MD5OfMessageBody: 'ffa3ca183028fe4cf7d6f32bb290bceb',
          MessageId: '8e2b4104-423c-46f0-b718-62616b6918d6',
        })
      )
    },
  ],
});

const sqsErrorStub = AWSStubGenerator({
  promises: [
    {
      name: 'sendMessage',
      callback: msg => {
        const e = new Error()
        e.message = 'The request has failed due to a temporary failure of the server.';
        e.code = 'AWS.SimpleQueueService.ServiceUnavailable';
        e.status = 503;
        return Promise.reject(e);
      }
    },
  ],
});

const dummyQueue = 'dummyQueue';
const dummyString = 'some string';
const dummyObject = {
  someKey: 'abc',
  other: 10,
};
const dummyRegion = 'dummy-region';

describe('SQSProducer Tests', function() {
  it('has a SQSProducer class', function() {
    expect(SQSProducer).to.be.a('function');
    const prod = new SQSProducer();
    expect(prod).to.be.an('object');
  });

  describe('publish tests', function() {
    it('has a publish method', function() {
      const prod = new SQSProducer();
      expect(prod.publish).to.be.a('function');
    });

    it('calls the sqs sendMessage with correct arguments', sinon.test(function(done) {
      const stub = this.stub(aws, 'SQS', sqsStub);
      const spy = this.spy(sqsStub.prototype, 'sendMessage');
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
      const stub = this.stub(aws, 'SQS', sqsErrorStub);
      const spy = this.spy(sqsErrorStub.prototype, 'sendMessage');
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
      const stub = this.stub(aws, 'SQS', sqsStub);
      const spy = this.spy(sqsStub.prototype, 'sendMessage');
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
  });

  describe('getRegion tests', function() {
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

  describe('setRegion tests', function() {
    it('has a setRegion method', function() {
      const prod = new SQSProducer();
      expect(prod.setRegion).to.be.a('function');
    });

    it('changes the sqs region', function() {
      const prod = new SQSProducer(dummyQueue);
      prod.setRegion(dummyRegion);

      expect(prod.getRegion()).to.be.equal(dummyRegion);
    });
  });
});
