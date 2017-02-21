'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');
const clearRequireCache = require('../testing-utils.js').clearRequireCache;

const sourcePath = path.join(__dirname, '../../source/');
const idPath = path.join(sourcePath, 'id');
const cwPath = path.join(sourcePath, 'aws/cw/logs.js');
const messagePath = path.join(sourcePath, 'message-utils');
const monitorPath = path.join(sourcePath, 'monitor');

const dummyName = 'dummy_name';
const dummyEnv = 'dummy_env';
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
    const cw = require(cwPath);
    const cwFake = function() {};
    cwFake.prototype.init = () => Promise.resolve();
    const cwStub = this.stub(cw, 'CWLogs', cwFake);

    const cwInitSpy = this.spy(cwStub.prototype, 'init');

    const id = require(idPath);
    const idStub = this.stub(id, 'getId', () => Promise.resolve(dummyId));

    const msg = require(messagePath);
    const msgStub = this.stub(msg, 'init', () => Promise.resolve());

    const monitor = require(monitorPath);
    monitor.init(dummyName, dummyEnv)
    .then(() => {
      expect(idStub).to.have.property('calledOnce', true);
      expect(msgStub).to.have.property('calledOnce', true);
      expect(cwStub).to.have.property('calledOnce', true);
      expect(cwInitSpy).to.have.property('calledOnce', true);
      process.removeListener('unhandledException', monitor.exceptionCb);
      process.removeListener('unhandledRejection', monitor.rejectionCb);
      done();
    })
    .catch(done);
  }));

  it('on unhandledException logs are put into cloudwatch and then the application exits', sinon.test(function(done) {
    const exitCache = process.exit;
    process.exit = sinon.spy();

    const cw = require(cwPath);
    const cwFake = function() {};
    cwFake.prototype.init = () => Promise.resolve();
    cwFake.prototype.putLogs = () => Promise.resolve();
    const cwStub = this.stub(cw, 'CWLogs', cwFake);
    const cwPutLogsSpy = this.spy(cwStub.prototype, 'putLogs');

    const cwInitSpy = this.spy(cwStub.prototype, 'init');

    const id = require(idPath);
    const idStub = this.stub(id, 'getId', () => Promise.resolve(dummyId));

    const msg = require(messagePath);
    const msgStub = this.stub(msg, 'init', () => Promise.resolve());
    const msgErrStub = this.stub(msg, 'getError', () => Promise.resolve());

    const monitor = require(monitorPath);
    monitor.init(dummyName, dummyEnv)
    .then(() => {
      process.emit('unhandledException', dummyError);
      setTimeout(() => {
        expect(cwPutLogsSpy).to.have.property('calledOnce', true);
        expect(process.exit).to.have.property('calledOnce', true);
        process.exit = exitCache;
        process.removeListener('unhandledException', monitor.exceptionCb);
        process.removeListener('unhandledRejection', monitor.rejectionCb);
        done();
      }, 50);
    })
    .catch(done);
  }));

  it('on unhandledRejection logs are put into cloudwatch and then the application exits', sinon.test(function(done) {
    const exitCache = process.exit;
    process.exit = sinon.spy();

    const cw = require(cwPath);
    const cwFake = function() {};
    cwFake.prototype.init = () => Promise.resolve();
    cwFake.prototype.putLogs = () => Promise.resolve();
    const cwStub = this.stub(cw, 'CWLogs', cwFake);
    const cwPutLogsSpy = this.spy(cwStub.prototype, 'putLogs');

    const cwInitSpy = this.spy(cwStub.prototype, 'init');

    const id = require(idPath);
    const idStub = this.stub(id, 'getId', () => Promise.resolve(dummyId));

    const msg = require(messagePath);
    const msgStub = this.stub(msg, 'init', () => Promise.resolve());
    const msgErrStub = this.stub(msg, 'getError', () => Promise.resolve());

    const monitor = require(monitorPath);
    monitor.init(dummyName, dummyEnv)
    .then(() => {
      process.emit('unhandledRejection', dummyError);
      setTimeout(() => {
        expect(cwPutLogsSpy).to.have.property('calledOnce', true);
        expect(process.exit).to.have.property('calledOnce', true);
        process.exit = exitCache;
        process.removeListener('unhandledException', monitor.exceptionCb);
        process.removeListener('unhandledRejection', monitor.rejectionCb);
        done();
      }, 50);
    })
    .catch(done);
  }));
});
