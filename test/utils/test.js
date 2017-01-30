'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const utils = require('../../source/utils');
const sleep = utils.sleep;
const stringBytes = utils.stringBytes;
const jsonSize = utils.jsonSize;

describe('Utils Tests Suite', function() {
  describe('sleep tests', function(){
    before(function() {
      sinon.config = {
        useFakeTimers: false,
      };
    });

    after(function() {
      sinon.config = {
        useFakeTimers: true,
      };
    });

    it('has sleep function', function(){
      expect(sleep).to.be.a('function');
    });

    it('the promise is resolved after the input value', function(done) {
      const ts_a = (new Date()).getTime();
      sleep(100)
      .then(() => {
        const ts_b = (new Date()).getTime();
        expect(ts_b - ts_a).to.be.at.least(100);
        expect(ts_b - ts_a).to.be.at.most(120);
        done();
      })
      .catch(done);
    });

    it('if undifined input then resolve on the next event loop', function(done) {
      const ts_a = (new Date()).getTime();
      sleep()
      .then(() => {
        const ts_b = (new Date()).getTime();
        expect(ts_b - ts_a).to.be.at.least(0);
        expect(ts_b - ts_a).to.be.at.most(5);
        done();
      })
      .catch(done);
    });
  });

  describe('stringBytes tests', function() {
    it('has a stringBytes function', function() {
      expect(stringBytes).to.be.a('function');
    });

    //expected results tested with https://mothereff.in/byte-counter
    it('calculates correctly the size of utf8 strings', function() {
      expect(stringBytes('')).to.be.equal(0);
      expect(stringBytes('a')).to.be.equal(1);
      expect(stringBytes('ab')).to.be.equal(2);
      expect(stringBytes('abc')).to.be.equal(3);
      expect(stringBytes('abcd')).to.be.equal(4);
      expect(stringBytes('abcde')).to.be.equal(5);
      expect(stringBytes('abcdef')).to.be.equal(6);
    });

    it('if no string is passed then the empty string is used', function() {
      expect(stringBytes()).to.be.equal(0);
      expect(stringBytes(null)).to.be.equal(0);
    });

    it('successfully parses emojis', function() {
      expect(stringBytes('i ♥ javascript')).to.be.equal(16);
    });
  });

  describe('jsonSize tests', function() {
    it('has a jsonSize function', function() {
      expect(jsonSize).to.be.a('function');
    });

    it('calculates correctly the size of json oblects', function() {
      expect(jsonSize({})).to.be.equal(2);
      expect(jsonSize({
        someKey: 3,
      })).to.be.equal(13);
      expect(jsonSize({
        someKey: 3,
        otherKey: 'a name',
      })).to.be.equal(33);
    });

    it('if json is undefined it returns 0', function(){
      expect(jsonSize()).to.be.equal(0);
    })
  });
});
