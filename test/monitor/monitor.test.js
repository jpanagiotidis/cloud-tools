'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');
const clearRequireCache = require('../testing-utils.js').clearRequireCache;

const sourcePath = path.join(__dirname, '../../source/');
const sqsPath = path.join(sourcePath, 'aws/sqs/producer.js');
const messagePath = path.join(sourcePath, 'message-utils');
const monitorPath = path.join(sourcePath, 'monitor');

const dummyName = 'dummy_name';
const dummyEnv = 'dummy_env';
const dummyQueue = 'dummy_queue';
const dummyId = '123';
const dummyError = new Error('Dummy Error');

describe('Monitor test suite', function(){
  before(function() {
    sinon.config = {
      useFakeTimers: false,
    };
  });

  after(function() {
    sinon.config = {
      useFakeTimers: true,
    };
  });

  beforeEach(function() {
    clearRequireCache();
  });

  afterEach(function() {
    clearRequireCache();
  });

  it('has an init function', function() {
    const init = require(monitorPath).init;
    expect(init).to.be.a('function');
  });

  it('init function does all the appropriate calls', sinon.test(function(done) {
    const sqs = require(sqsPath);
    const sqsFake = function() {};
    sqsFake.prototype.init = () => Promise.resolve();
    const sqsStub = this.stub(sqs, 'SQSProducer', sqsFake);

    const msg = require(messagePath);
    const msgStub = this.stub(msg, 'init', () => Promise.resolve());

    const monitor = require(monitorPath);
    monitor.init(dummyName, dummyEnv, dummyQueue)
    .then(() => {
      expect(msgStub).to.have.property('calledOnce', true);
      expect(sqsStub).to.have.property('calledOnce', true);
      expect(sqsStub.args[0][0]).to.be.equal(dummyQueue);
      process.removeListener('uncaughtException', monitor.exceptionCb);
      process.removeListener('unhandledRejection', monitor.rejectionCb);
      done();
    })
    .catch(done);
  }));

  it('on uncaughtException logs are put into cloudwatch and then the application exits', sinon.test(function(done) {
    const originalException = process.listeners('uncaughtException').pop();
    process.removeListener('uncaughtException', originalException);

    const exitCache = process.exit;
    process.exit = sinon.spy();

    const sqs = require(sqsPath);
    const sqsFake = function() {};
    sqsFake.prototype.publish = () => Promise.resolve();
    const sqsStub = this.stub(sqs, 'SQSProducer', sqsFake);
    const sqsPublishSpy = this.spy(sqsStub.prototype, 'publish');

    const msg = require(messagePath);
    const msgStub = this.stub(msg, 'init', () => Promise.resolve());
    const msgErrStub = this.stub(msg, 'getError', () => Promise.resolve());

    const monitor = require(monitorPath);
    monitor.init(dummyName, dummyEnv)
    .then(() => {
      process.emit('uncaughtException', dummyError);
      setTimeout(() => {
        expect(sqsPublishSpy).to.have.property('calledOnce', true);
        expect(process.exit).to.have.property('calledOnce', true);
        process.exit = exitCache;
        process.removeListener('uncaughtException', monitor.exceptionCb);
        process.removeListener('unhandledRejection', monitor.rejectionCb);
        process.on('uncaughtException', originalException);
        done();
      }, 50);
    })
    .catch(done);
  }));

  it('on unhandledRejection logs are put into cloudwatch and then the application exits', sinon.test(function(done) {
    const exitCache = process.exit;
    process.exit = sinon.spy();

    const sqs = require(sqsPath);
    const sqsFake = function() {};
    sqsFake.prototype.init = () => Promise.resolve();
    sqsFake.prototype.publish = () => Promise.resolve();
    const sqsStub = this.stub(sqs, 'SQSProducer', sqsFake);
    const sqsPublishSpy = this.spy(sqsStub.prototype, 'publish');

    const msg = require(messagePath);
    const msgStub = this.stub(msg, 'init', () => Promise.resolve());
    const msgErrStub = this.stub(msg, 'getError', () => Promise.resolve());

    const monitor = require(monitorPath);
    monitor.init(dummyName, dummyEnv)
    .then(() => {
      process.emit('unhandledRejection', dummyError);
      setTimeout(() => {
        expect(sqsPublishSpy).to.have.property('calledOnce', true);
        expect(process.exit).to.have.property('calledOnce', true);
        process.exit = exitCache;
        process.removeListener('uncaughtException', monitor.exceptionCb);
        process.removeListener('unhandledRejection', monitor.rejectionCb);
        done();
      }, 50);
    })
    .catch(done);
  }));
});
