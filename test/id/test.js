'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');

const modulePath = path.join(__dirname, '../../source/id/index.js');
const awsPath = path.join(__dirname, '../../source/aws/index.js');
const ec2Path = path.join(__dirname, '../../source/aws/ec2.js');

const serviceName = 'DUMMY_APP';
const fakeEC2Id = '123';
const fakeTime = '2016-06-16T16:33:56Z';
const fakeTS = (new Date(fakeTime)).getTime();
const pid = process.pid;

describe('Id Module Tests', function(){
  beforeEach(function(){
    delete require.cache[awsPath];
    delete require.cache[ec2Path];
    delete require.cache[modulePath];
  });

  it('has getId function', function(){
    const id = require(modulePath);
    expect(id.getId).to.be.a('function');
  });

  it('if NODE_ENV is not production then a dummy value must be returned', sinon.test(function(done){
    this.stub(process, 'env', Object.assign(
      {},
      process.env,
      {
        'NODE_ENV': 'development',
      }
    ));

    const id = require(modulePath);

    id.getId(serviceName)
    .then((res) => {
      expect(res).to.match(/^DUMMY_APP-[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]{10}$/);
      done();
    })
    .catch(done);
  }));

  it('if NODE_ENV is production then ec2 meta must be called', sinon.test(function(done){
    this.clock = sinon.useFakeTimers(fakeTS);
    this.stub(process, 'env', Object.assign(
      {},
      process.env,
      {
        'NODE_ENV': 'production',
      }
    ));
    const aws = require(awsPath);

    const awsStub = this.stub(aws.ec2, 'getInstanceId', () => {
      return Promise.resolve(fakeEC2Id);
    });

    const id = require(modulePath);

    id.getId(serviceName)
    .then((res) => {
      expect(awsStub.callCount).to.be.equal(1);
      expect(res).to.be.equal(`${serviceName}-${fakeEC2Id}-${pid}-${fakeTS}`);
      done();
    })
    .catch(done);
  }));

  it('after the first call it returns a cached version', sinon.test(function(done){
    this.clock = sinon.useFakeTimers(fakeTS);
    this.stub(process, 'env', Object.assign(
      {},
      process.env,
      {
        'NODE_ENV': 'production',
      }
    ));

    const aws = require(awsPath);

    const awsStub = this.stub(aws.ec2, 'getInstanceId', () => {
      return Promise.resolve(fakeEC2Id);
    });

    const id = require(modulePath);

    id.getId(serviceName)
    .then((res) => {
      expect(awsStub.callCount).to.be.equal(1);
      expect(res).to.be.equal(`${serviceName}-${fakeEC2Id}-${pid}-${fakeTS}`);
    })
    .then((res) => {
      return id.getId(serviceName);
    })
    .then((res) => {
      expect(awsStub.callCount).to.be.equal(1);
      expect(res).to.be.equal(`${serviceName}-${fakeEC2Id}-${pid}-${fakeTS}`);
      done();
    })
    .catch(done);
  }));

  it('if aws throws error then getId throws error', sinon.test(function(done){
    this.clock = sinon.useFakeTimers(fakeTS);
    this.stub(process, 'env', Object.assign(
      {},
      process.env,
      {
        'NODE_ENV': 'production',
      }
    ));

    const aws = require(awsPath);

    const awsStub = this.stub(aws.ec2, 'getInstanceId', () => {
      return Promise.reject();
    });

    const id = require(modulePath);

    id.getId(serviceName)
    .then((res) => {
      done(new Error('It shouldn\'t succeed'));
    })
    .catch((err) => {
      expect(awsStub.callCount).to.be.equal(1);
      done();
    });
  }));
});
