'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');

const sourcePath = path.join(__dirname, '../../source/');

describe('Entry point test suite', function(){
  beforeEach(function() {
    delete require.cache;
  });

  afterEach(function() {
    delete require.cache;
  });

  it('has the getId function', sinon.test(function(){
    const id = require(path.join(sourcePath, 'id'));
    const stub = this.stub(id, 'getId', () => {});
    const ctools = require('../../index.js');
    expect(ctools.getId).to.be.a('function');
    ctools.getId();
    expect(stub).to.have.property('calledOnce', true);
  }));

  it('has the eventBus', sinon.test(function() {
    const EventEmitter = require('events');
    const bus = require(path.join(sourcePath, 'event-bus'));
    expect(bus).to.be.instanceOf(EventEmitter);
  }));
});
