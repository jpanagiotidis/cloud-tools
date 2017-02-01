'use strict';

const _ = require('lodash');
const Chance = require('chance');
const crypto = require('crypto');

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
