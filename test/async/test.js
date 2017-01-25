'use strict';

const path = require('path');
const expect = require('chai').expect;
const sinon = require('sinon');

const errorMsg = 'Weird Error';
const modulePath = path.join(__dirname, '../../source/async/index.js');
sinon.config = {
  useFakeTimers: false
};

describe('Async Module Tests', function(){

  it('has chain function', function(){
    const async = require(modulePath);
    expect(async.chain).to.be.a('function');
  });

  it('promises are executed in chain', sinon.test(function(done){
    const async = require(modulePath);

    const pSpy1 = this.spy(dummyPromise);
    const pSpy2 = this.spy(dummyPromise);
    const pSpy3 = this.spy(dummyPromise);
    const args1 = ['a', 'b', 'c'];
    const args2 = [1, 3, 5];
    const args3 = ['someValue'];

    const data = [
      {
        promise: pSpy1,
        arguments: args1,
      },
      {
        promise: pSpy2,
        arguments: args2,
      },
      {
        promise: pSpy3,
        arguments: args3,
      },
    ];

    async.chain(data)
    .then((res) => {
      expect(pSpy1).to.have.property('callCount', 1);
      expect(pSpy2).to.have.property('callCount', 1);
      expect(pSpy3).to.have.property('callCount', 1);
      expect(pSpy1.calledBefore(pSpy2)).to.be.equal(true);
      expect(pSpy2.calledBefore(pSpy3)).to.be.equal(true);
      expect(pSpy1.args[0]).to.be.eql(args1);
      expect(pSpy2.args[0]).to.be.eql(args2);
      expect(pSpy3.args[0]).to.be.eql(args3);
      expect(res[0]).to.be.equal(args1.join('-'));
      expect(res[1]).to.be.equal(args2.join('-'));
      expect(res[2]).to.be.equal(args3.join('-'));
      done();
    })
    .catch(done);
  }));

  it('if one promise fails then the whole chain fails (but return the results so far and the error)', sinon.test(function(done){
    const async = require(modulePath);

    const pSpy1 = this.spy(dummyPromise);
    const pSpy2 = this.spy(dummyPromise);
    const pSpy3 = this.spy(dummyErrorPromise);
    const pSpy4 = this.spy(dummyPromise);
    const args1 = ['a', 'b', 'c'];
    const args2 = [1, 3, 5];
    const args3 = ['someValue'];

    const data = [
      {
        promise: pSpy1,
        arguments: args1,
      },
      {
        promise: pSpy2,
        arguments: args2,
      },
      {
        promise: pSpy3,
        arguments: args3,
      },
      {
        promise: pSpy4,
      },
    ];

    async.chain(data)
    .then((res) => {
      done(new Error('It should have failed'));
    })
    .catch((err) => {
      try {
        expect(pSpy1).to.have.property('callCount', 1);
        expect(pSpy2).to.have.property('callCount', 1);
        expect(pSpy3).to.have.property('callCount', 1);
        expect(pSpy4).to.have.property('callCount', 0);
        expect(pSpy1.calledBefore(pSpy2)).to.be.equal(true);
        expect(pSpy2.calledBefore(pSpy3)).to.be.equal(true);
        expect(pSpy1.args[0]).to.be.eql(args1);
        expect(pSpy2.args[0]).to.be.eql(args2);
        expect(pSpy3.args[0]).to.be.eql(args3);
        expect(err.results).to.have.length(2);
        expect(err.results).to.be.eql([
          args1.join('-'),
          args2.join('-'),
        ]);
        expect(err.error).to.be.eql(new Error(errorMsg));
        done();
      } catch (e) {
        done(e);
      }
    });
  }));
});

function dummyPromise(){
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Array.prototype.slice.call(arguments).join('-'));
    }, 20);
  });
}

function dummyErrorPromise(){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(errorMsg));
    }, 20);
  });
}
