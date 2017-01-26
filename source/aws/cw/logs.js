'use strict';

const config = require('../config.js').services.CloudWatchLogs;
const debug = require('../../debug');
const aws = require('aws-sdk');
const prepareLogsBatches = require('./utils.js').prepareLogsBatches;
const chain = require('../../async').chain;

const debugName = 'CWLogs';

class CWLogs {
  constructor(groupName, streamName, data) {
    this.cw = new aws.CloudWatchLogs(Object.assign(
      {},
      config,
      data,
      {
        apiVersion: config.apiVersion,
      }
    ));

    this.groupName = groupName;
    this.streamName = streamName;
  }

  init() {
    return this.checkGroupExists(this.groupName)
    .then((res) => {
      if(res === false){
        debug(debugName, 'Creating Group:', this.groupName);
        return this.createGroup(this.groupName);
      }
      debug(debugName, 'Group exists:', this.groupName);
      return Promise.resolve();
    })
    .then((res) => {
      return this.checkStreamExists(this.groupName, this.streamName);
    })
    .then((res) => {
      if(res === false){
        debug(debugName, 'Creating Stream:', this.streamName);
        return this.createStream(this.groupName, this.streamName);
      }
      debug(debugName, 'Stream exists:', this.streamName);
      return Promise.resolve();
    });
  }

  checkGroupExists() {
    return this.cw.describeLogGroups({
      logGroupNamePrefix: this.groupName,
    }).promise()
    .then((res) => {
      return Promise.resolve(res.logGroups.length > 0);
    });
  }

  createGroup() {
    return this.cw.createLogGroup({
      logGroupName: this.groupName,
    }).promise();
  }

  checkStreamExists() {
    return this.cw.describeLogStreams({
      logGroupName: this.groupName,
      logStreamNamePrefix: this.streamName,
    }).promise()
    .then((res) => {
      const stream = res.logStreams.filter((s) => {
        return s.logStreamName === this.streamName;
      })[0];
      if(stream){
        this.sequenceToken = stream.uploadSequenceToken;
      }
      return Promise.resolve(!!stream);
    });
  }

  createStream() {
    return this.cw.createLogStream({
      logGroupName: this.groupName,
      logStreamName: this.streamName,
    }).promise();
  }

  putLogs(data) {
    if(data.length === 0){
      debug(debugName, 'putLogs: No data to send!');
      return Promise.resolve();;
    }
    const batches = prepareLogsBatches(data);
    debug(debugName, 'putLogs: Start sending data');
    console.log('\n\nLLLL', batches, '\n\n');
    console.log(batches.length);
    for (var i = 0; i < batches.length; i++) {
      console.log('MMM', batches[i]);
    }
    return chain(batches.map((b, i) => {
      console.log('\n\nB', b, i, b.length, '\n\n');
      return {
        arguments: [b],
        promise: this.putBatch.bind(this),
      };
    }))
    .then(() => {
      debug(debugName, 'putLogs: Sending data completed');
      return Promise.resolve();
    });
  }

  putBatch(data) {
    debug(debugName, 'putBatch: Start sending data', data);
    return this.cw.putLogEvents({
      logEvents: data,
      logGroupName: this.groupName,
      logStreamName: this.streamName,
      sequenceToken: this.sequenceToken,
    }).promise()
    .then((res) => {
      debug(debugName, 'putBatch: Sending data completed');
      this.sequenceToken = res.nextSequenceToken;
      return Promise.resolve();
    });
  }
}

module.exports = {
  CWLogs,
}
