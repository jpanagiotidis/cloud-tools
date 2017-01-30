'use strict';

const getEC2Id = require('../aws').ec2.getInstanceId;
const DateObj = require('../date-utils').DateObj;
const Chance = require('chance');

let id;

function createId(name) {
  if (['production', 'prod'].indexOf(process.env.NODE_ENV) === -1) {
    const ch = new Chance();
    return Promise.resolve(`${name}-${ch.string({
      length: 10,
      pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    })}`);
  }
  return new Promise((resolve, reject) => {
    getEC2Id()
    .then((ec2Id) => {
      const ts = (new DateObj()).getTimestamp();
      resolve(`${name}-${ec2Id}-${process.pid}-${ts}`);
    })
    .catch(reject);
  });
}

function getId(name) {
  if (id) {
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
