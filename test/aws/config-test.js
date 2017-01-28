'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const config = require('../../source/aws/config.js');
const _ = require('lodash');

describe('AWS Config Tests Suite', function(){
  // beforeEach(function(){
  //   const keys = _.chain(require.cache)
  //   .map((x, k) => k)
  //   .filter(
  //     (x) => (x.indexOf('node_modules/aws-sdk') !== -1)
  //   )
  //   .value();
  //   // console.log(keys);
  //   // _.each(keys, x => {
  //     // console.log('DELETING', x);
  //     // delete require.cache[x];
  //   // });
  // });
  //
  // it('has a services data object with correct api versions', function(){
  //   expect(config.services).to.be.an('object');
  //   expect(config.services.SQS.apiVersion).to.be.equal('2012-11-05');
  // });
  //
  // it('has a setConfig function', function(){
  //   expect(config.setConfig).to.be.a('function');
  // });
  //
  // it('has a getConfig function', function(){
  //   expect(config.getConfig).to.be.a('function');
  // });
  //
  // it('a', function(){
  //   const config = require('../../source/aws/config.js');
  // });
  //
  // it('b', function(){
  //   const config = require('../../source/aws/config.js');
  // });
});
