'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');

const indexPath = path.join(__dirname, '../../source/message-utils/index.js');
const modulePath = path.join(__dirname, '../../source/message-utils/config.js');
const idPath = path.join(__dirname, '../../source/id/index.js');
const awsPath = path.join(__dirname, '../../source/aws/index.js');
const ec2Path = path.join(__dirname, '../../source/aws/ec2.js');

const ec2Module = require(ec2Path);

const dummyName = 'dummy_name';
const dummyEnv = 'dummy_env';
const dummyId = '123';

describe('MessageUtils Config Tests', function() {
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
    delete require.cache[indexPath];
    delete require.cache[modulePath];
    delete require.cache[idPath];
    delete require.cache[awsPath];
    delete require.cache[ec2Path];
  });

  afterEach(function() {
    delete require.cache[indexPath];
    delete require.cache[modulePath];
    delete require.cache[idPath];
    delete require.cache[awsPath];
    delete require.cache[ec2Path];
  });

  it('has init function', function() {
    const init = require(indexPath).init;
    expect(init).to.be.a('function');
  });

  it('serviceName and environmentName arguments are mandatory', function(done) {
    const init = require(indexPath).init;
    const config = require(modulePath).getConfig();
    expect(config.SERVICE_NAME).to.be.equal(undefined);
    expect(config.ENVIRONMENT_NAME).to.be.equal(undefined);
    init()
    .then(() => {
      done(new Error('It should be rejected'));
    })
    .catch((err) => {
      done();
    });
  });

  it('init should complete if args are provided', sinon.test(function(done) {
    this.stub(require('../../source/aws/ec2.js'), 'getInstanceId', () => (
      Promise.resolve(dummyId)
    ));

    const init = require(indexPath).init;
    const config = require(modulePath).getConfig();

    expect(config.SERVICE_NAME).to.be.equal(undefined);
    expect(config.ENVIRONMENT_NAME).to.be.equal(undefined);
    expect(config.INSTANCE_ID).to.be.equal(undefined);

    init(dummyName, dummyEnv)
    .then(() => {
      expect(config.SERVICE_NAME).to.be.equal(dummyName);
      expect(config.ENVIRONMENT_NAME).to.be.equal(dummyEnv);
      expect(config.INSTANCE_ID.indexOf(dummyName)).to.be.equal(0);
      done();
    })
    .catch(done);
  }));

  it('reject if getId is rejected', sinon.test(function(done) {
    this.stub(require('../../source/id/index.js'), 'getId', () => (Promise.reject(new Error('Connection error'))));

    const init = require(indexPath).init;
    init(dummyName, dummyEnv)
    .then(() => {
      done(new Error('It should be rejected.'));
    })
    .catch((err) => {
      done();
    });
  }));

  it('has isReady function', function() {
    const isReady = require(indexPath).isReady;
    expect(isReady).to.be.a('function');
  });

  it('returns false if not initialized', function() {
    const config = require(modulePath).getConfig();
    const isReady = require(indexPath).isReady;

    expect(config.SERVICE_NAME).to.be.equal(undefined);
    expect(config.ENVIRONMENT_NAME).to.be.equal(undefined);
    expect(config.INSTANCE_ID).to.be.equal(undefined);

    expect(isReady()).to.be.equal(false);
  });

  it('returns true if it initialized', sinon.test(function(done) {
    this.stub(require('../../source/aws/ec2.js'), 'getInstanceId', () => (
      Promise.resolve(dummyId)
    ));

    const init = require(indexPath).init;
    const config = require(modulePath).getConfig();
    const isReady = require(indexPath).isReady;

    expect(config.SERVICE_NAME).to.be.equal(undefined);
    expect(config.ENVIRONMENT_NAME).to.be.equal(undefined);
    expect(config.INSTANCE_ID).to.be.equal(undefined);

    init(dummyName, dummyEnv)
    .then(() => {
      expect(config.SERVICE_NAME).to.be.equal(dummyName);
      expect(config.ENVIRONMENT_NAME).to.be.equal(dummyEnv);
      expect(config.INSTANCE_ID.indexOf(dummyName)).to.be.equal(0);
      expect(isReady()).to.be.equal(true);
      done();
    })
    .catch(done);
  }));

  it('has getConfig function', function() {
    const getConfig = require(modulePath).getConfig;
    expect(getConfig).to.be.a('function');
  });

  it('config has the correct values', function() {
    const config = require(modulePath).getConfig();
    expect(config).to.be.an('object');

    expect(config.KEYS).to.have.property('TIME_STAMP', 'TIME_STAMP');
    expect(config.KEYS).to.have.property('ENVIRONMENT_NAME', 'ENVIRONMENT_NAME');
    expect(config.KEYS).to.have.property('INSTANCE_ID', 'INSTANCE_ID');
    expect(config.KEYS).to.have.property('MESSAGE', 'MESSAGE');
    expect(config.KEYS).to.have.property('TYPE', 'TYPE');
    expect(config.KEYS).to.have.property('ERROR_TYPE', 'ERROR_TYPE');

    expect(config.VALUES.TYPE).to.have.property('INFO', 'INFO');
    expect(config.VALUES.TYPE).to.have.property('AUDIT', 'AUDIT');
    expect(config.VALUES.TYPE).to.have.property('ERROR', 'ERROR');

    expect(config.ERRORS.MISSING_NAME_AND_ENV_ARGS).to.be.a('string');
    expect(config.ERRORS.NOT_INITIALIZED).to.be.a('string');
  });
});
