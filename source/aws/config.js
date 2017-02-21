'use strict';

const aws = require('aws-sdk');
const configUtils = require('../config/utils.js');

const env = configUtils.env;
const bool = configUtils.bool;

const configGlobal = {
  signatureVersion: 'v4',
  region: env('AWS_SERVICE_REGION', 'eu-west-1'),
  maxRetries: env('AWS_MAX_RETRIES', 5),
};

const other = {
  FAKE: bool('AWS_FAKE', false),
  FAKE_META: bool('AWS_FAKE_META', false),
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
  other,
  setConfig,
  getConfig,
};
