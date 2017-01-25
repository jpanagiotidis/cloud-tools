'use strict';

const config = require('../config.js').services.CloudWatchLogs;
const aws = require('aws-sdk');

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
        return this.createGroup(this.groupName);
      }
      return Promise.resolve();
    })
    .then((res) => {
      return this.checkStreamExists(this.groupName, this.streamName);
    })
    .then((res) => {
      if(res === false){
        return this.createStream(this.groupName, this.streamName);
      }
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
      return Promise.resolve();;
    }

    data = data.sort((a, b) => {
      if(a.timestamp > b.timestamp){
        return 1;
      }else if(a.timestamp < b.timestamp){
        return -1;
      }else{
        return 0;
      }
    });
    return this.cw.putLogEvents({
      logEvents: data,
      logGroupName: this.groupName,
      logStreamName: this.streamName,
      sequenceToken: this.sequenceToken,
    }).promise()
    .then((res) => {
      this.sequenceToken = res.nextSequenceToken;
      return Promise.resolve();
    });
  }
}

module.exports = {
  CWLogs,
}
