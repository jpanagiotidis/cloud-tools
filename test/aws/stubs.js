'use strict';

const _ = require('lodash');
const Chance = require('chance');
const crypto = require('crypto');
const moment = require('moment');

const chance = new Chance();

function AWSStubGenerator(data) {
  data = data || {};
  const stub = function(){};

  _.each(data.promises, p => {
    if(p.name && p.callback) {
      stub.prototype[p.name] = (data) => {
        return {
          promise: p.callback.bind(null, data),
        };
      };
    }
  });

  return stub;
}

function getAWSString(length) {
  return chance.string({
    pool: 'abcdefghijklmnopqrstuvwxyz0123456789',
    length,
  });
}

function getId(){
  const out = [];
  out.push(getAWSString(8));
  out.push(getAWSString(4));
  out.push(getAWSString(4));
  out.push(getAWSString(4));
  out.push(getAWSString(12));
  return out.join('-');
}

function responseBase() {
  return {
    ResponseMetadata: {
      RequestId: getId(),
    },
  };
}

const responseGenerator = {
  SQS: {
    sendMessage: (msg) => (Object.assign(
      responseBase(),
      {
        MD5OfMessageBody: crypto.createHash('md5').update(msg).digest("hex"),
        MessageId: getId(),
      }
    ))
  },
  CW: {
    describeLogGroups: (groups) => {
      if(!_.isArray(groups)) {
        if(_.isString(groups)){
          groups = [groups];
        }else{
          groups = [];
        }
      }

      const logGroups = groups.map(x => ({
        logGroupName: x,
        creationTime: chance.integer({
          min: moment.utc().subtract(20, 'days').valueOf(),
          max: moment.utc().subtract(4, 'days').valueOf(),
        }),
        metricFilterCount: chance.integer({
          min: 0,
          max: 5,
        }),
        arn: `arn:aws:logs:some-region:123456789:log-group:${x}:*`,
        storedBytes: chance.integer({
          min: 0,
          max: 10000,
        }),
      }));

      return {
        logGroups,
      };
    },
    describeLogStreams: (streams) => {
      if(!_.isArray(streams)) {
        if(_.isString(streams)){
          streams = [streams];
        }else{
          streams = [];
        }
      }

      const logStreams = streams.map(x => ({
        logStreamName: x,
        creationTime: chance.integer({
          min: moment.utc().subtract(10, 'days').valueOf(),
          max: moment.utc().subtract(8, 'days').valueOf(),
        }),
        firstEventTimestamp: chance.integer({
          min: moment.utc().subtract(10, 'days').valueOf(),
          max: moment.utc().subtract(1, 'days').valueOf(),
        }),
        lastEventTimestamp: chance.integer({
          min: moment.utc().subtract(10, 'days').valueOf(),
          max: moment.utc().subtract(1, 'days').valueOf(),
        }),
        lastIngestionTime: chance.integer({
          min: moment.utc().subtract(10, 'days').valueOf(),
          max: moment.utc().subtract(1, 'days').valueOf(),
        }),
        uploadSequenceToken: chance.integer({
          min: 10000000000,
          max: 99999999999,
        }),
        arn: `arn:aws:logs:eu-west-1:12345678:log-group:some-group:log-stream:${x}`,
        storedBytes: chance.integer({
          min: 0,
          max: 10000,
        }),
      }));

      return {
        logStreams,
      };
    },
    putLogEvents: () => {
      return {
        nextSequenceToken: chance.integer({
          min: 10000000000,
          max: 99999999999,
        }),
      }
    },
  },
};

function dataGenerator(length) {
  return chance.string({
    pool: 'abcdefghijklmnopqrstuvwxyz      ',
    length,
  });
};

module.exports = {
  AWSStubGenerator,
  responseGenerator,
  dataGenerator,
};
