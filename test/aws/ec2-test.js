'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const aws = require('aws-sdk');
const path = require('path');

const modulePath = path.join(__dirname, '../../source/aws/index.js');
const ec2Path = path.join(__dirname, '../../source/aws/ec2.js');
const testName = 'TEST_APP';
const testId = 123456;

describe('AWS EC2 Tests Suite', function(){
  beforeEach(function(){
    delete require.cache[ec2Path];
    delete require.cache[modulePath];
  });

  it('has getInstanceId function', function(){
    const ec2 = require(modulePath).ec2;

    expect(ec2.getInstanceId).to.be.a('function');
  });

  it('getInstanceId calls MetadataService request with /latest/meta-data/instance-id', sinon.test(function(done){
    const ec2 = require(modulePath).ec2;

    const metaStub = this.stub(
      aws.MetadataService.prototype,
      'request'
    );

    ec2.getInstanceId()
    .then((res) => {
      expect(metaStub.getCall(0).args[0])
      .to.be.equal('/latest/meta-data/instance-id');
      expect(res).to.be.equal(testId);
      done();
    })
    .catch((err) => {
      done(err);
    });

    metaStub.yield(null, testId);
  }));

  it('second call to getInstanceId returns a cached value', sinon.test(function(done){
    const ec2 = require(modulePath).ec2;

    const metaStub = this.stub(
      aws.MetadataService.prototype,
      'request'
    );

    ec2.getInstanceId()
    .then((res) => {
      expect(metaStub.callCount).to.be.equal(1);
      expect(res).to.be.equal(testId);
    })
    .then((res) => {
      return ec2.getInstanceId();
    })
    .then((res) => {
      expect(metaStub.callCount).to.be.equal(1);
      expect(res).to.be.equal(testId);
      done();
    })
    .catch((err) => {
      done(err);
    });

    metaStub.yield(null, testId);
  }));

  it('if error is thrown from meta.request then getInstanceId throws error', sinon.test(function(done){
    const ec2 = require(modulePath).ec2;

    const metaStub = this.stub(
      aws.MetadataService.prototype,
      'request'
    );

    ec2.getInstanceId()
    .then((res) => {
      expect(metaStub.callCount).to.be.equal(1);
      expect(res).to.be.equal(testId);
    })
    .catch((err) => {
      expect(metaStub.callCount).to.be.equal(1);
      done();
    });

    metaStub.yield((new Error()), null);
  }));
});
