'use strict';

const config = require('../config.js');
const debug = require('../../debug');
const aws = require('aws-sdk');
const prepareLogsBatches = require('./utils.js').prepareLogsBatches;
const chain = require('../../async').chain;

const configCW = config.services.CloudWatchLogs;
const FAKE = config.other.FAKE;
const debugName = 'CWLogs';

class CWLogs {
  constructor(groupName, streamName, data) {
    this.cw = new aws.CloudWatchLogs(Object.assign(
      {},
      configCW,
      data,
      {
        apiVersion: configCW.apiVersion,
      }
    ));

    this.groupName = groupName;
    this.streamName = streamName;
  }

  init() {
    if (FAKE) {
      debug(debugName, 'fake init', this.groupName);
      return Promise.resolve();
    }

    return this.checkGroupExists(this.groupName)
    .then((res) => {
      if (res === false) {
        debug(debugName, 'Creating Group:', this.groupName);
        return this.createGroup(this.groupName);
      }
      debug(debugName, 'Group exists:', this.groupName);
      return Promise.resolve();
    })
    .then(
      () => (this.checkStreamExists(this.groupName, this.streamName))
    )
    .then((res) => {
      if (res === false) {
        debug(debugName, 'Creating Stream:', this.streamName);
        return this.createStream(this.groupName, this.streamName);
      }
      debug(debugName, 'Stream exists:', this.streamName);
      return Promise.resolve();
    });
  }

  setSequenceToken(token) {
    this.sequenceToken = token;
  }

  getSequenceToken() {
    return this.sequenceToken;
  }

  checkGroupExists() {
    return this.cw.describeLogGroups({
      logGroupNamePrefix: this.groupName,
    }).promise()
    .then(
      (res) => {
        const group = res.logGroups.filter(
          g => (g.logGroupName === this.groupName)
        )[0];

        return Promise.resolve(!!group);
      }
    );
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
      const stream = res.logStreams.filter(
        s => (s.logStreamName === this.streamName)
      )[0];
      if (stream) {
        this.setSequenceToken(stream.uploadSequenceToken);
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
    if (FAKE) {
      debug(debugName, 'putLogs fake', data);
      return Promise.resolve();
    }

    if (data.length === 0) {
      debug(debugName, 'putLogs: No data to send!', data);
      return Promise.resolve();
    }
    const batches = prepareLogsBatches(data);
    debug(debugName, 'putLogs: Start sending data');
    return chain(batches.map(b => ({
      arguments: [b],
      promise: this.putBatch.bind(this),
    })))
    .then(() => {
      debug(debugName, 'putLogs: Sending data completed');
      return Promise.resolve();
    });
  }

  putBatch(data) {
    if (FAKE) {
      debug(debugName, 'putBatch fake', data);
      return Promise.resolve();
    }

    if (data.length === 0) {
      debug(debugName, 'putBatch: No data to send!', data);
      return Promise.resolve();
    }
    debug(debugName, 'putBatch: Start sending data', data);
    return this.cw.putLogEvents({
      logEvents: data,
      logGroupName: this.groupName,
      logStreamName: this.streamName,
      sequenceToken: this.getSequenceToken(),
    }).promise()
    .then((res) => {
      debug(debugName, 'putBatch: Sending data completed');
      this.setSequenceToken(res.nextSequenceToken);
      return Promise.resolve();
    });
  }
}

module.exports = {
  CWLogs,
};
