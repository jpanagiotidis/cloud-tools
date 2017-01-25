'use strict';

const getId = require('./source/id').getId;
const config = require('./source/config/utils.js');
const aws = require('./source/aws');

module.exports = {
  getId,
  config,
  aws,
};
