'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');

const indexPath = path.join(__dirname, '../../source/message-utils/config.js');
const configPath = path.join(__dirname, '../../source/message-utils/config.js');
const basePath = path.join(__dirname, '../../source/message-utils/base.js');
const idPath = path.join(__dirname, '../../source/id/index.js');
const awsPath = path.join(__dirname, '../../source/aws/index.js');
const awsConfigPath = path.join(__dirname, '../../source/aws/config.js');
const ec2Path = path.join(__dirname, '../../source/aws/ec2.js');

const dummyName = 'dummy_name';
const dummyEnv = 'dummy_env';
const dummyId = '123';

describe('MessageUtils Base Tests', function() {
  beforeEach(function() {
    delete require.cache[indexPath];
    delete require.cache[configPath];
    delete require.cache[basePath];
    delete require.cache[idPath];
    delete require.cache[awsPath];
    delete require.cache[awsConfigPath];
    delete require.cache[ec2Path];
  });

  afterEach(function() {
    delete require.cache[indexPath];
    delete require.cache[configPath];
    delete require.cache[basePath];
    delete require.cache[idPath];
    delete require.cache[awsPath];
    delete require.cache[awsConfigPath];
    delete require.cache[ec2Path];
  });

  it('has getLogTemplate function', function() {
    const base = require(basePath);
    expect(base.getLogTemplate).to.be.a('function');
  });

  it('if getLogTemplate is called without initialized config throws an error', function() {
    const base = require(basePath);
    expect(base.getLogTemplate).to.throw(Error);
  });

  it('has the correct attributes', sinon.test(function(done) {
    this.stub(require('../../source/aws/ec2.js'), 'getInstanceId', () => (
      Promise.resolve(dummyId)
    ));

    const init = require(indexPath).init;
    const getLogTemplate = require(basePath).getLogTemplate;

    init(dummyName, dummyEnv)
    .then(() => {
      const msg = getLogTemplate();
      expect(msg.TIME_STAMP).to.be.an('number');
      expect(msg).to.have.property('ENVIRONMENT_NAME', dummyEnv);
      expect(msg.INSTANCE_ID.indexOf(dummyName)).to.be.equal(0);
      done();
    })
    .catch(done);
  }));
});
