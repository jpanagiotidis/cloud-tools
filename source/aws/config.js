'use strict';

const aws = require('aws-sdk');
const configUtils = require('../config/utils.js');

const env = configUtils.env;
const check = configUtils.check;

const configGlobal = {
  signatureVersion: 'v4',
  region: process.env.AWS_SERVICE_REGION,
  maxRetries: env('AWS_MAX_RETRIES', 5),
};

const services = {
  SQS: {
    apiVersion: '2012-11-05',
  },
  CloudWatchLogs: {
    apiVersion: '2014-03-28',
  },
};

aws.config.update(configGlobal);

function setConfig(data) {
  aws.config.update(data);
}

function getConfig() {
  return aws.config;
}

module.exports = {
  services,
  setConfig,
  getConfig,
}
