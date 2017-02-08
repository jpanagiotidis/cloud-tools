'use strict';

const expect = require('chai').expect;
const utils = require('../../source/aws/cw/utils.js');
const getData = require('./stubs.js').dataGenerator;
const getSize = require('../../source/utils').jsonSize;

const TIME_THRESHOLD = 1000 * 60 * 60 * 23;
const SIZE_THRESHOLD = 1000000;

describe('CW Utils Tests', function() {
  describe('sortLogs tests', function() {
    it('has a sortLogs function', function() {
      expect(utils.sortLogs).to.be.a('function');
    });

    it('sorts correctly an array of cloudwatch logs', function() {
      const logs = [
        { timestamp: 5, message: 'e', },
        { timestamp: 4, message: 'd', },
        { timestamp: 2, message: 'b', },
        { timestamp: 1, message: 'a', },
        { timestamp: 3, message: 'c', },
      ];

      const res = utils.sortLogs(logs);
      expect(res).to.be.an('array');
      expect(res).to.have.property('length', 5);
      expect(res[0]).to.have.property('timestamp', 1);
      expect(res[0]).to.have.property('message', 'a');
      expect(res[1]).to.have.property('timestamp', 2);
      expect(res[1]).to.have.property('message', 'b');
      expect(res[2]).to.have.property('timestamp', 3);
      expect(res[2]).to.have.property('message', 'c');
      expect(res[3]).to.have.property('timestamp', 4);
      expect(res[3]).to.have.property('message', 'd');
      expect(res[4]).to.have.property('timestamp', 5);
      expect(res[4]).to.have.property('message', 'e');
    });

    it('empty array input returns empty array', function() {
      const res = utils.sortLogs([]);
      expect(res).to.be.an('array');
      expect(res).to.be.eql([]);
      expect(res).to.have.property('length', 0);
    });

    it('if no array is passed an error is returned', function() {
      expect(utils.sortLogs).to.throw(Error);
    });

    it('if sorted array is passed then the same array is returned', function (){
      const logs = [
        { timestamp: 1, message: 'a', },
        { timestamp: 2, message: 'b', },
        { timestamp: 3, message: 'c', },
        { timestamp: 4, message: 'd', },
      ];

      const res = utils.sortLogs(logs);
      expect(res).to.be.an('array');
      expect(res).to.have.property('length', 4);
      expect(res).to.be.eql(logs);
    });
  });

  describe('prepareLogsBatches tests', function() {
    it('has a prepareLogsBatches function', function() {
      expect(utils.prepareLogsBatches).to.be.a('function');
    });

    it('if all the logs can fit into a single batch then a single batch is returned', function() {
      const logs = [
        { timestamp: 3 * TIME_THRESHOLD + 100, message: getPayload('a', 2000), },
        { timestamp: 3 * TIME_THRESHOLD + 101, message: getPayload('b', 2000), },
        { timestamp: 3 * TIME_THRESHOLD + 102, message: getPayload('c', 2000), },
        { timestamp: 3 * TIME_THRESHOLD + 103, message: getPayload('d', 2000), },
        { timestamp: 3 * TIME_THRESHOLD + 104, message: getPayload('e', 2000), },
        { timestamp: 3 * TIME_THRESHOLD + 105, message: getPayload('f', 2000), },
        { timestamp: 3 * TIME_THRESHOLD + 105, message: getPayload('g', 2000), },
      ];

      const res = utils.prepareLogsBatches(logs);

      expect(res).to.be.an('array');
      expect(res).to.have.a.property('length', 1);
      expect(res[0]).to.be.an('array');
      expect(res[0]).to.have.a.property('length', 7);
      expect(getSize(res[0])).to.be.at.most(SIZE_THRESHOLD);

      expect(res[0][0]).to.be.an('object');
      expect(res[0][0].message).to.be.an('object');
      expect(res[0][0].message).to.have.a.property('id', 'a');

      expect(res[0][1]).to.be.an('object');
      expect(res[0][1].message).to.be.an('object');
      expect(res[0][1].message).to.have.a.property('id', 'b');

      expect(res[0][2]).to.be.an('object');
      expect(res[0][2].message).to.be.an('object');
      expect(res[0][2].message).to.have.a.property('id', 'c');

      expect(res[0][3]).to.be.an('object');
      expect(res[0][3].message).to.be.an('object');
      expect(res[0][3].message).to.have.a.property('id', 'd');

      expect(res[0][4]).to.be.an('object');
      expect(res[0][4].message).to.be.an('object');
      expect(res[0][4].message).to.have.a.property('id', 'e');

      expect(res[0][5]).to.be.an('object');
      expect(res[0][5].message).to.be.an('object');
      expect(res[0][5].message).to.have.a.property('id', 'f');

      expect(res[0][6]).to.be.an('object');
      expect(res[0][6].message).to.be.an('object');
      expect(res[0][6].message).to.have.a.property('id', 'g');
    });

    it('separates logs using the cloudwatch threshold of 24 hours for a single batch', function() {
      const logs = [
        { timestamp: 3 * TIME_THRESHOLD + 505, message: getPayload('h', 200), },
        { timestamp: TIME_THRESHOLD + 305, message: getPayload('e', 200), },
        { timestamp: 15, message: getPayload('c', 100), },
        { timestamp: TIME_THRESHOLD + 505, message: getPayload('f', 200), },
        { timestamp: 3 * TIME_THRESHOLD + 105, message: getPayload('g', 200), },
        { timestamp: 5, message: getPayload('a', 200), },
        { timestamp: TIME_THRESHOLD + 105, message: getPayload('d', 200), },
        { timestamp: 10, message: getPayload('b', 200), },
      ];

      const res = utils.prepareLogsBatches(logs);
      expect(res).to.be.an('array');
      expect(res).to.have.a.property('length', 3);

      expect(res[0]).to.be.an('array');
      expect(res[0]).to.have.a.property('length', 3);
      expect(getSize(res[0])).to.be.at.most(SIZE_THRESHOLD);
      expect(res[0][0]).to.be.an('object');
      expect(res[0][0].message).to.be.an('object');
      expect(res[0][0].message).to.have.a.property('id', 'a');
      expect(res[0][1]).to.be.an('object');
      expect(res[0][1].message).to.be.an('object');
      expect(res[0][1].message).to.have.a.property('id', 'b');
      expect(res[0][2]).to.be.an('object');
      expect(res[0][2].message).to.be.an('object');
      expect(res[0][2].message).to.have.a.property('id', 'c');

      expect(res[1]).to.be.an('array');
      expect(res[1]).to.have.a.property('length', 3);
      expect(getSize(res[1])).to.be.at.most(SIZE_THRESHOLD);
      expect(res[1][0]).to.be.an('object');
      expect(res[1][0].message).to.be.an('object');
      expect(res[1][0].message).to.have.a.property('id', 'd');
      expect(res[1][1]).to.be.an('object');
      expect(res[1][1].message).to.be.an('object');
      expect(res[1][1].message).to.have.a.property('id', 'e');
      expect(res[1][2]).to.be.an('object');
      expect(res[1][2].message).to.be.an('object');
      expect(res[1][2].message).to.have.a.property('id', 'f');

      expect(res[2]).to.be.an('array');
      expect(res[2]).to.have.a.property('length', 2);
      expect(getSize(res[2])).to.be.at.most(SIZE_THRESHOLD);
      expect(res[2][0]).to.be.an('object');
      expect(res[2][0].message).to.be.an('object');
      expect(res[2][0].message).to.have.a.property('id', 'g');
      expect(res[2][1]).to.be.an('object');
      expect(res[2][1].message).to.be.an('object');
      expect(res[2][1].message).to.have.a.property('id', 'h');
    });

    it('seperates the logs into batches smaller than 1MB', function() {
      const logs = [
        { timestamp: 3 * TIME_THRESHOLD + 104, message: getPayload('e', 300000), },
        { timestamp: 3 * TIME_THRESHOLD + 103, message: getPayload('d', 300000), },
        { timestamp: 3 * TIME_THRESHOLD + 101, message: getPayload('b', 300000), },
        { timestamp: 3 * TIME_THRESHOLD + 100, message: getPayload('a', 300000), },
        { timestamp: 3 * TIME_THRESHOLD + 102, message: getPayload('c', 300000), },
      ];

      const res = utils.prepareLogsBatches(logs);
      expect(res).to.be.an('array');
      expect(res).to.have.a.property('length', 2);

      expect(res[0]).to.be.an('array');
      expect(res[0]).to.have.a.property('length', 3);
      expect(getSize(res[0])).to.be.at.most(SIZE_THRESHOLD);

      expect(res[0][0]).to.be.an('object');
      expect(res[0][0].message).to.be.an('object');
      expect(res[0][0].message).to.have.a.property('id', 'a');

      expect(res[0][1]).to.be.an('object');
      expect(res[0][1].message).to.be.an('object');
      expect(res[0][1].message).to.have.a.property('id', 'b');

      expect(res[0][2]).to.be.an('object');
      expect(res[0][2].message).to.be.an('object');
      expect(res[0][2].message).to.have.a.property('id', 'c');

      expect(res[1]).to.be.an('array');
      expect(res[1]).to.have.a.property('length', 2);
      expect(getSize(res[1])).to.be.at.most(SIZE_THRESHOLD);

      expect(res[1][0]).to.be.an('object');
      expect(res[1][0].message).to.be.an('object');
      expect(res[1][0].message).to.have.a.property('id', 'd');

      expect(res[1][1]).to.be.an('object');
      expect(res[1][1].message).to.be.an('object');
      expect(res[1][1].message).to.have.a.property('id', 'e');
    });

    it('if no input the it returns an empty array',  function() {
      const res = utils.prepareLogsBatches();
      expect(res).to.be.eql([]);
    });
  });
});

function getPayload(id, size) {
  return {
    id,
    data: getData(size),
  };
}
