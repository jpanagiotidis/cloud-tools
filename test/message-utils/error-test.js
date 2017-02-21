'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');

const indexPath = path.join(__dirname, '../../source/message-utils/index.js');
const errorPath = path.join(__dirname, '../../source/message-utils/error.js');
const configPath = path.join(__dirname, '../../source/message-utils/config.js');
const basePath = path.join(__dirname, '../../source/message-utils/base.js');
const idPath = path.join(__dirname, '../../source/id/index.js');
const awsPath = path.join(__dirname, '../../source/aws/index.js');
const ec2Path = path.join(__dirname, '../../source/aws/ec2.js');

const dummyName = 'dummy_name';
const dummyEnv = 'dummy_env';
const dummyErrorType = 'dummy_type';
const dummyMessage = 'some message';
const dummyId = '123';

describe('MessageUtils Error message Tests', function() {
  beforeEach(function() {
    delete require.cache[indexPath];
    delete require.cache[configPath];
    delete require.cache[errorPath];
    delete require.cache[basePath];
    delete require.cache[idPath];
    delete require.cache[awsPath];
    delete require.cache[ec2Path];
  });

  afterEach(function() {
    delete require.cache[indexPath];
    delete require.cache[configPath];
    delete require.cache[errorPath];
    delete require.cache[basePath];
    delete require.cache[idPath];
    delete require.cache[awsPath];
    delete require.cache[ec2Path];
  });

  it('has getError function', function() {
    const getError = require(indexPath).getError;
    expect(getError).to.be.a('function');
  });

  it('if called without initialized config throws an error', function() {
    const getError = require(indexPath).getError;
    expect(getError).to.throw(Error);
  });

  it('has the correct attributes', sinon.test(function(done) {
    this.stub(require('../../source/aws/ec2.js'), 'getInstanceId', () => (
      Promise.resolve(dummyId)
    ));

    const init = require(indexPath).init;
    const getError = require(indexPath).getError;

    init(dummyName, dummyEnv)
    .then(() => {
      const msg = getError(dummyErrorType, dummyMessage);
      expect(msg.TIME_STAMP).to.be.an('number');
      expect(msg).to.have.property('ENVIRONMENT_NAME', dummyEnv);
      expect(msg.INSTANCE_ID.indexOf(dummyName)).to.be.equal(0);
      expect(msg).to.have.property('TYPE', 'ERROR');
      expect(msg).to.have.property('ERROR_TYPE', dummyErrorType);
      expect(msg).to.have.property('MESSAGE', dummyMessage);
      done();
    })
    .catch(done);
  }));

  it('if errorType isnt provided it throws an error', sinon.test(function(done) {
    this.stub(require('../../source/aws/ec2.js'), 'getInstanceId', () => (
      Promise.resolve(dummyId)
    ));

    const init = require(indexPath).init;
    const getError = require(indexPath).getError;

    init(dummyName, dummyEnv)
    .then(() => {
      expect(getError).to.throw(Error);
      done();
    })
    .catch(done);
  }));

  it('has getCommonErrorTypes function', function() {
    const getCommonErrorTypes = require(indexPath).getCommonErrorTypes;
    expect(getCommonErrorTypes).to.be.a('function');
  });

  it('getCommonErrorTypes returns the correct attributes', function() {
    const getCommonErrorTypes = require(indexPath).getCommonErrorTypes;
    const errors = getCommonErrorTypes();
    expect(errors).to.have.property('UNHANDLED_REJECTION', 'UNHANDLED_REJECTION');
    expect(errors).to.have.property('UNHANDLED_EXCEPTION', 'UNHANDLED_EXCEPTION');
    expect(errors).to.have.property('DEAD_LETTER_QUEUE_MESSAGE', 'DEAD_LETTER_QUEUE_MESSAGE');
    expect(errors).to.have.property('SYNTAX_ERROR', 'SYNTAX_ERROR');
    expect(errors).to.have.property('TYPE_ERROR', 'TYPE_ERROR');
  });
});
