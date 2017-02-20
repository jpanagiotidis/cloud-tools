'use strict';

const getEC2Id = require('../aws').ec2.getInstanceId;
const debug = require('../debug');
const DateObj = require('../date-utils').DateObj;

const debugName = 'CloudID';
let id;

function getId(name) {
  if (id) {
    debug(debugName, 'getId: returning cached id');
    return Promise.resolve(id);
  }

  debug(debugName, 'getId: generating fresh aws id');
  return new Promise((resolve, reject) => {
    getEC2Id()
    .then((ec2Id) => {
      const ts = (new DateObj()).getTimestamp();
      id = `${name}-${ec2Id}-${process.pid}-${ts}`;
      debug(debugName, `getId: returning id ${id}`);
      resolve(id);
    })
    .catch(reject);
  });
}

module.exports = {
  getId,
};
