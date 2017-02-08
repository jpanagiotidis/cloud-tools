'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const aws = require('aws-sdk');
const stubs = require('./stubs.js');
const CWLogs = require('../../source/aws/cw').CWLogs;

const describeGroupsResponse = stubs.responseGenerator.CW.describeLogGroups;
const describeStreamsResponse = stubs.responseGenerator.CW.describeLogStreams;
const putLogEventsResponse = stubs.responseGenerator.CW.putLogEvents;
const AWSStubGenerator = stubs.AWSStubGenerator;

const existingPrefix = 'existing-';
const newPrefix = 'new-';
const existingGroup = `${existingPrefix}group`;
const newGroup = `${newPrefix}group`;
const existingStream = `${existingPrefix}stream`;
const newStream = `${newPrefix}stream`;
const dummyLogs = [
  { timestamp: 5, message: 'e', },
  { timestamp: 4, message: 'd', },
  { timestamp: 2, message: 'b', },
  { timestamp: 1, message: 'a', },
  { timestamp: 3, message: 'c', },
];

const cwStub = AWSStubGenerator({
  promises: [
    {
      name: 'describeLogGroups',
      callback: data => {
        const groups = [
          `${data.logGroupNamePrefix}-abc`,
          `${data.logGroupNamePrefix}-123`,
        ]
        if(data.logGroupNamePrefix.indexOf(existingPrefix) === 0) {
          groups.push(data.logGroupNamePrefix);
        }
        return Promise.resolve(describeGroupsResponse(groups));
      },
    },
    {
      name: 'createLogGroup',
      callback: group => {
        return Promise.resolve({});
      },
    },
    {
      name: 'describeLogStreams',
      callback: data => {
        const streams = [
          `${data.logStreamNamePrefix}-abc`,
          `${data.logStreamNamePrefix}-123`,
        ];
        if(data.logStreamNamePrefix.indexOf(existingPrefix) === 0) {
          streams.push(data.logStreamNamePrefix);
        }

        return Promise.resolve(describeStreamsResponse(streams));
      },
    },
    {
      name: 'createLogStream',
      callback: () => {
        return Promise.resolve({});
      },
    },
    {
      name: 'putLogEvents',
      callback: (data) => {
        if(data === 'error') {
          const err = new Error();
          Promise.reject(err);
        }

        return Promise.resolve(putLogEventsResponse());
      },
    },
  ],
});

describe('CWLogs Constructor Tests', function() {
  it('has CWLogs contructor', function() {
    expect(CWLogs).to.be.a('function');
    const cw = new CWLogs(existingGroup, existingStream);
    expect(cw).to.be.an('object');
  });

  describe('init method tests', function() {
    it('creates the log group if it doesnt exist', sinon.test(function(done) {
      const stubGroupCheck = this.stub(aws, 'CloudWatchLogs', cwStub);

      const spyDescGroups = this.spy(cwStub.prototype, 'describeLogGroups');
      const spyCreateGroup = this.spy(cwStub.prototype, 'createLogGroup');

      const cw = new CWLogs(newGroup, newStream);

      cw.init()
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(true);
        done();
      })
      .catch(done);
    }));

    it('doesnt create group if it exists', sinon.test(function(done) {
      const stubGroupCheck = this.stub(aws, 'CloudWatchLogs', cwStub);

      const spyDescGroups = this.spy(cwStub.prototype, 'describeLogGroups');
      const spyCreateGroup = this.spy(cwStub.prototype, 'createLogGroup');

      const cw = new CWLogs(existingGroup, newStream);

      cw.init()
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        done();
      })
      .catch(done);
    }));

    it('creates stream if it doesnt exist', sinon.test(function(done) {
      const stubGroupCheck = this.stub(aws, 'CloudWatchLogs', cwStub);

      const spyDescGroups = this.spy(cwStub.prototype, 'describeLogGroups');
      const spyCreateGroup = this.spy(cwStub.prototype, 'createLogGroup');
      const spyDescStreams = this.spy(cwStub.prototype, 'describeLogStreams');
      const spyCreateStream = this.spy(cwStub.prototype, 'createLogStream');

      const cw = new CWLogs(existingGroup, newStream);

      cw.init()
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(true);
        done();
      })
      .catch(done);
    }));

    it('doesnt create stream if it exists', sinon.test(function(done) {
      const stubGroupCheck = this.stub(aws, 'CloudWatchLogs', cwStub);

      const spyDescGroups = this.spy(cwStub.prototype, 'describeLogGroups');
      const spyCreateGroup = this.spy(cwStub.prototype, 'createLogGroup');
      const spyDescStreams = this.spy(cwStub.prototype, 'describeLogStreams');
      const spyCreateStream = this.spy(cwStub.prototype, 'createLogStream');

      const cw = new CWLogs(existingGroup, existingStream);

      cw.init()
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(false);
        done();
      })
      .catch(done);
    }));

  });

  describe('putLogs tests', function() {
    it('if the stream doesnt exist then on the first call no sequence token is passed', sinon.test(function(done) {
      const stubGroupCheck = this.stub(aws, 'CloudWatchLogs', cwStub);

      const spyDescGroups = this.spy(cwStub.prototype, 'describeLogGroups');
      const spyCreateGroup = this.spy(cwStub.prototype, 'createLogGroup');
      const spyDescStreams = this.spy(cwStub.prototype, 'describeLogStreams');
      const spyCreateStream = this.spy(cwStub.prototype, 'createLogStream');
      const spyPutLogs = this.spy(cwStub.prototype, 'putLogEvents');
      const spySetSequenceToken = this.spy(CWLogs.prototype, 'setSequenceToken');

      const cw = new CWLogs(existingGroup, newStream);

      cw.init()
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(true);
        expect(spySetSequenceToken.calledOnce).to.be.equal(false);
        return cw.putLogs(dummyLogs);
      })
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(true);
        expect(spySetSequenceToken.calledOnce).to.be.equal(true);
        const tokenA = spySetSequenceToken.args[0][0];
        expect(spyPutLogs.calledOnce).to.be.equal(true);
        expect(spyPutLogs.args[0][0]).to.have.property('sequenceToken', undefined);
        done();
      })
      .catch(done);
    }));

    it('if stream exists then the first putLogEvents call is using the sequence token from the describeLogStreams call', sinon.test(function(done) {
      const stubGroupCheck = this.stub(aws, 'CloudWatchLogs', cwStub);

      const spyDescGroups = this.spy(cwStub.prototype, 'describeLogGroups');
      const spyCreateGroup = this.spy(cwStub.prototype, 'createLogGroup');
      const spyDescStreams = this.spy(cwStub.prototype, 'describeLogStreams');
      const spyCreateStream = this.spy(cwStub.prototype, 'createLogStream');
      const spyPutLogs = this.spy(cwStub.prototype, 'putLogEvents');
      const spySetSequenceToken = this.spy(CWLogs.prototype, 'setSequenceToken');

      const cw = new CWLogs(existingGroup, existingStream);

      cw.init()
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(false);
        expect(spySetSequenceToken.calledOnce).to.be.equal(true);
        return cw.putLogs(dummyLogs);
      })
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(false);
        expect(spySetSequenceToken.calledTwice).to.be.equal(true);
        const tokenA = spySetSequenceToken.args[0][0];
        const tokenB = spySetSequenceToken.args[1][0];
        expect(spyPutLogs.calledOnce).to.be.equal(true);
        expect(spyPutLogs.args[0][0]).to.have.property('sequenceToken', tokenA);
        expect(tokenA).to.be.not.equal(tokenB);
        done();
      })
      .catch(done);
    }));

    it('if the input array is empty resolve the promise immediately', sinon.test(function(done) {
      const stubGroupCheck = this.stub(aws, 'CloudWatchLogs', cwStub);

      const spyDescGroups = this.spy(cwStub.prototype, 'describeLogGroups');
      const spyCreateGroup = this.spy(cwStub.prototype, 'createLogGroup');
      const spyDescStreams = this.spy(cwStub.prototype, 'describeLogStreams');
      const spyCreateStream = this.spy(cwStub.prototype, 'createLogStream');
      const spyPutLogs = this.spy(cwStub.prototype, 'putLogEvents');
      const spySetSequenceToken = this.spy(CWLogs.prototype, 'setSequenceToken');

      const cw = new CWLogs(existingGroup, newStream);

      cw.init()
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(true);
        expect(spySetSequenceToken.calledOnce).to.be.equal(false);
        return cw.putLogs([]);
      })
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(true);
        expect(spySetSequenceToken.calledOnce).to.be.equal(false);
        expect(spyPutLogs.callCount).to.be.equal(0);
        done();
      })
      .catch(done);
    }));

    it('it uses the previous sequence token and updates it', sinon.test(function(done) {
      const stubGroupCheck = this.stub(aws, 'CloudWatchLogs', cwStub);

      const spyDescGroups = this.spy(cwStub.prototype, 'describeLogGroups');
      const spyCreateGroup = this.spy(cwStub.prototype, 'createLogGroup');
      const spyDescStreams = this.spy(cwStub.prototype, 'describeLogStreams');
      const spyCreateStream = this.spy(cwStub.prototype, 'createLogStream');
      const spyPutLogs = this.spy(cwStub.prototype, 'putLogEvents');
      const spySetSequenceToken = this.spy(CWLogs.prototype, 'setSequenceToken');

      const cw = new CWLogs(existingGroup, newStream);

      cw.init()
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(true);
        expect(spySetSequenceToken.calledOnce).to.be.equal(false);
        return cw.putLogs(dummyLogs);
      })
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(true);
        expect(spySetSequenceToken.calledOnce).to.be.equal(true);
        expect(spyPutLogs.calledOnce).to.be.equal(true);
        expect(spyPutLogs.args[0][0]).to.have.property('sequenceToken', undefined);
        return cw.putLogs(dummyLogs);
      })
      .then(res => {
        expect(spySetSequenceToken.calledTwice).to.be.equal(true);
        const tokenA = spySetSequenceToken.args[0][0];
        const tokenB = spySetSequenceToken.args[1][0];
        expect(spyPutLogs.args[1][0]).to.have.property('sequenceToken', tokenA);
        expect(tokenA).to.be.not.equal(tokenB);
        done();
      })
      .catch(done);
    }));
  });

  describe('putBatch tests', function() {
    it('if the input array is empty resolve the promise immediately', sinon.test(function(done) {
      const stubGroupCheck = this.stub(aws, 'CloudWatchLogs', cwStub);

      const spyDescGroups = this.spy(cwStub.prototype, 'describeLogGroups');
      const spyCreateGroup = this.spy(cwStub.prototype, 'createLogGroup');
      const spyDescStreams = this.spy(cwStub.prototype, 'describeLogStreams');
      const spyCreateStream = this.spy(cwStub.prototype, 'createLogStream');
      const spyPutLogs = this.spy(cwStub.prototype, 'putLogEvents');
      const spySetSequenceToken = this.spy(CWLogs.prototype, 'setSequenceToken');

      const cw = new CWLogs(existingGroup, newStream);

      cw.init()
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(true);
        expect(spySetSequenceToken.calledOnce).to.be.equal(false);
        return cw.putBatch([]);
      })
      .then(res => {
        expect(spyDescGroups.calledOnce).to.be.equal(true);
        expect(spyCreateGroup.calledOnce).to.be.equal(false);
        expect(spyDescStreams.calledOnce).to.be.equal(true);
        expect(spyCreateStream.calledOnce).to.be.equal(true);
        expect(spySetSequenceToken.calledOnce).to.be.equal(false);
        expect(spyPutLogs.callCount).to.be.equal(0);
        done();
      })
      .catch(done);
    }));
  });
});
