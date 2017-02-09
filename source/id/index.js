'use strict';

const getEC2Id = require('../aws').ec2.getInstanceId;
const debug = require('../debug');
const DateObj = require('../date-utils').DateObj;
const Chance = require('chance');

let id;
const debugName = 'CloudID';

function createId(name) {
  if (['development', 'dev'].indexOf(process.env.NODE_ENV) !== -1) {
    debug(debugName, 'createId: generating fresh fake id');
    const ch = new Chance();
    return Promise.resolve(`${name}-${ch.string({
      length: 10,
      pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    })}`);
  }
  return new Promise((resolve, reject) => {
    debug(debugName, 'generating fresh aws id');
    getEC2Id()
    .then((ec2Id) => {
      const ts = (new DateObj()).getTimestamp();
      debug(debugName, 'createId: completed aws id');
      resolve(`${name}-${ec2Id}-${process.pid}-${ts}`);
    })
    .catch(reject);
  });
}

function getId(name) {
  if (id) {
    debug(debugName, 'getId: returning cached ID');
    return Promise.resolve(id);
  }

  return new Promise((resolve, reject) => {
    createId(name)
    .then((_id) => {
      id = _id;
      resolve(id);
    })
    .catch(reject);
  });
}

module.exports = {
  getId,
};
