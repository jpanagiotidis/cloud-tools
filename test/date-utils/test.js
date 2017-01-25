'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const dateUtils = require('../../source/date-utils');

const utcString = '2016-06-16T16:33:56Z';
const indiaString = '2016-06-16T22:03:56+05:30';
const utcTS = (new Date(utcString)).getTime();
const indiaTS = (new Date(indiaString)).getTime();


describe('Test date-utils', function(){
  describe('Test DateObj class', function(){
    it('has a DateObj function', function(){
      expect(dateUtils.DateObj).to.be.a('function');
    });

    it('instances must have the getTimestamp method', function(){
      const t = new dateUtils.DateObj();
      expect(t.getTimestamp).to.be.a('function');
    });

    it('instances must have the getFormatted method', function(){
      const t = new dateUtils.DateObj();
      expect(t.getFormatted).to.be.a('function');
    });

    it('instances must have the getUTCString method', function(){
      const t = new dateUtils.DateObj();
      expect(t.getUTCString).to.be.a('function');
    });

    it('if no argument is passed in the constructor, the current time must be assigned', sinon.test(function(){
      this.clock = sinon.useFakeTimers(indiaTS);
      const t = new dateUtils.DateObj();
      expect(t.getUTCString()).to.be.equal(utcString);
    }));

    it('if a unix timestamp is passed in the constructor, a time object based on this timestamp must be created', function(){
      const t = new dateUtils.DateObj(indiaTS);
      expect(t.getUTCString()).to.be.equal(utcString);
    });

    it('utc string must be the same across different timezones', function(){
      const t1 = new dateUtils.DateObj(utcTS);
      const t2 = new dateUtils.DateObj(indiaTS);
      expect(t1.getUTCString()).to.be.equal(t2.getUTCString());
    });

    it('utc string must end with the Z character', function(){
      const t = new dateUtils.DateObj(indiaTS);
      const utc = t.getUTCString();
      expect(utc[utc.length - 1]).to.be.equal('Z');
    });

    it('getFormatted must return a string using the passed format', function(){
      const t = new dateUtils.DateObj(indiaTS);
      const f = t.getFormatted('YYYY/MM/DD');
      expect(f).to.be.equal('2016/06/16');
    });

    it('getTimestamp must return a unix timestamp', function(){
      const t = new dateUtils.DateObj(indiaTS);
      expect(t.getTimestamp()).to.be.equal(utcTS);
    });
  });
});
