'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const config = require('../../source/aws/config.js');
const aws = require('aws-sdk');
const _ = require('lodash');

describe('AWS Config Tests Suite', function(){
  it('has a services data object with correct api versions', function(){
    expect(config.services).to.be.an('object');
    expect(config.services.SQS.apiVersion).to.be.equal('2012-11-05');
    expect(config.services.CloudWatchLogs.apiVersion).to.be.equal('2014-03-28');
  });

  describe('getConfig tests', function() {
    it('has a getConfig function', function(){
      expect(config.getConfig).to.be.a('function');
    });

    it('it returns the aws global configuration object', function() {
      const c = config.getConfig();
      expect(c).to.be.eql(aws.config);
    });
  });

  describe('setConfig tests', function() {
    it('has a setConfig function', function() {
      expect(config.setConfig).to.be.a('function');
    });

    it('it updates the aws global configuration object', function() {
      config.setConfig({
        maxRetries: 10,
      })
      const c = config.getConfig();
      expect(c).to.have.property('maxRetries', 10);
      expect(aws.config).to.have.property('maxRetries', 10);
    });
  });
});
