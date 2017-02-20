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
  before(function() {
    sinon.config = {
      useFakeTimers: true,
    };
  });

  beforeEach(function(){
    delete require.cache[awsPath];
    delete require.cache[ec2Path];
    delete require.cache[modulePath];
  });

  afterEach(function(){
    delete require.cache[awsPath];
    delete require.cache[ec2Path];
    delete require.cache[modulePath];
  });

  it('has getId function', function(){
    const id = require(modulePath);
    expect(id.getId).to.be.a('function');
  });

  it('calls the ec2 getInstanceId function', sinon.test(function(done) {
    const awsStub = this.stub(require(ec2Path), 'getInstanceId', () => (
      Promise.resolve(fakeEC2Id)
    ));

    const id = require(modulePath);

    id.getId(serviceName)
    .then((res) => {
      expect(awsStub.callCount).to.be.equal(1);
      done();
    })
    .catch(done);
  }));

  it('has the correct format', sinon.test(function(done) {
    this.clock = sinon.useFakeTimers(fakeTS);
    const awsStub = this.stub(require(ec2Path), 'getInstanceId', () => (
      Promise.resolve(fakeEC2Id)
    ));

    const id = require(modulePath);

    id.getId(serviceName)
    .then((res) => {
      expect(awsStub.callCount).to.be.equal(1);
      expect(res).to.be.equal(`${serviceName}-${fakeEC2Id}-${pid}-${fakeTS}`)
      done();
    })
    .catch(done);
  }));

  it('returns a cached version if it called multple times', sinon.test(function(done) {
    this.clock = sinon.useFakeTimers(fakeTS);
    const awsStub = this.stub(require(ec2Path), 'getInstanceId', () => (
      Promise.resolve(fakeEC2Id)
    ));

    const id = require(modulePath);

    let id_a;

    id.getId(serviceName)
    .then((res) => {
      expect(awsStub.callCount).to.be.equal(1);
      id_a = res;
      expect(res).to.be.equal(`${serviceName}-${fakeEC2Id}-${pid}-${fakeTS}`)
      return id.getId(serviceName);
    })
    .then((res) => {
      expect(awsStub.callCount).to.be.equal(1);
      expect(res).to.be.equal(id_a);
      return id.getId(serviceName);
    })
    .then((res) => {
      expect(awsStub.callCount).to.be.equal(1);
      expect(res).to.be.equal(id_a);
      done();
    })
    .catch(done);
  }));
});
