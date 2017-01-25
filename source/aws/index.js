'use strict';

const ec2 = require('./ec2.js');
const sqs = require('./sqs');
const cw = require('./cw');

module.exports = {
  ec2,
  sqs,
  cw,
};
