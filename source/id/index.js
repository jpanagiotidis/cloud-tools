'use strict';

const getEC2Id = require('../aws').ec2.getInstanceId;
const debug = require('../debug');
const getTimestamp = require('../date-utils').getTimestamp;

const debugName = 'CloudID';
let id;

function getId(name) {
  if (!id) {
    debug(debugName, 'getId: generating fresh aws id');
    id = new Promise((resolve, reject) => {
      getEC2Id()
      .then((ec2Id) => {
        const ts = getTimestamp();
        id = `${name}-${ec2Id}-${process.pid}-${ts}`;
        debug(debugName, `getId: returning id ${id}`);
        resolve(id);
      })
      .catch(reject);
    });
  }

  return id;
}

module.exports = {
  getId,
};
