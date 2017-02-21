'use strict';

const aws = require('aws-sdk');
const config = require('./config.js').other;

const meta = new aws.MetadataService();
const Chance = require('chance');
const debug = require('../debug');

let id;
const debugName = 'EC2';

function fetchId() {
  return new Promise((resolve, reject) => {
    if (config.FAKE || config.FAKE_META) {
      debug(debugName, 'fetchId: faking instance id call');
      const ch = new Chance();
      return resolve(ch.string({
        length: 10,
        pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      }));
    }

    debug(debugName, 'fetchId: starting instance id call');
    return meta.request('/latest/meta-data/instance-id', (err, data) => {
      if (err) {
        return reject(new Error('EC2 instance unreachable'));
      }
      id = data;
      debug(debugName, 'fetchId: completed instance id call');
      return resolve(data);
    });
  });
}

function getInstanceId() {
  if (id) {
    debug(debugName, 'getInstanceId: returning cached id');
    return Promise.resolve(id);
  }
  debug(debugName, 'getInstanceId: returning aws id promise');
  return fetchId();
}

module.exports = {
  getInstanceId,
};
