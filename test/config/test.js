'use strict';

const path = require('path');
const expect = require('chai').expect;
const sinon = require('sinon');
const _ = require('lodash');

const configPath = path.resolve(__dirname, '../../source/config/utils.js');
const ERROR_MISSING_ENV = require(configPath).ERROR_MISSING_ENV;
const ERROR_BOOL_VAL = require(configPath).ERROR_BOOL_VAL;

const testKey = 'TEST_KEY';
const testKeyB = 'TEST_KEY_B';
const testKeyC = 'TEST_KEY_C';
const valueA = 42;
const valueB = 'this is not the meaning of life';
let sandbox;

describe('Config Module Tests', function(){

  beforeEach(function(){
    delete require.cache[configPath];
  });

  describe('Utils Tests', function(){
    it('has check utility function', function(){
      const check = require(configPath).check;
      expect(check).to.be.a('function');
    });

    describe('Utility function env Tests', function(){
      it('has env function', function(){
        const env = require(configPath).env;
        expect(env).to.be.a('function');
      });

      it('assign default value if environment variable is missing and default value has been provided', sinon.test(function(){
        const utils = require(configPath);
        if(process.env[testKey]){
          this.stub(process, 'env', _.omit(process.env, testKey));
        }
        const configData = {};
        configData[testKey] = utils.env(testKey, valueB);
        expect(configData[testKey]).to.equal(valueB);
        expect(utils.check).to.not.throw('error');
      }));

      it('assign environment variable value if only environment variable has been provided', sinon.test(function(){
        const utils = require(configPath);
        const tempObj = {};
        tempObj[testKey] = valueA;
        this.stub(process, 'env', Object.assign(
          {},
          process.env,
          tempObj
        ));
        const configData = {};
        configData[testKey] = utils.env(testKey);
        expect(configData[testKey]).to.equal(valueA);
        expect(utils.check).to.not.throw('error');
      }));

      it('assign environment variable value if environment variable and default value has been provided', sinon.test(function(){
        const utils = require(configPath);
        const tempObj = {};
        tempObj[testKey] = valueA;
        this.stub(process, 'env', Object.assign(
          {},
          process.env,
          tempObj
        ));
        const configData = {};
        configData[testKey] = utils.env(testKey, valueB);
        expect(configData[testKey]).to.equal(valueA);
        expect(utils.check).to.not.throw('error');
      }));

      it('throw an error if environment variables are missing and no default values have been provided', sinon.test(function(){
        const utils = require(configPath);
        if(process.env[testKey]){
          this.stub(process, 'env', _.omit(process.env, testKey));
        }

        const configData = {};
        configData[testKey] = utils.env(testKey);
        configData[testKeyB] = utils.env(testKeyB);
        configData[testKeyC] = utils.env(testKeyC);

        expect(utils.check).to.throw(ERROR_MISSING_ENV);
        try {
          utils.check();
        } catch (e) {
          expect(e.missingEnvs)
          .to.be.an('array')
          .and.to.contain(testKey)
          .and.to.contain(testKeyB)
          .and.to.contain(testKeyC);
          expect(e.missingEnvs.length).to.equal(3);
        }
      }));
    });

    describe('Utility function bool Tests', function(){
      it('has bool function', function(){
        const bool = require(configPath).bool;
        expect(bool).to.be.a('function');
      });

      it('throw an error if environment variable has not allowed string value', sinon.test(function(){
        const bool = require(configPath).bool;
        const tempObj = {};
        tempObj[testKey] = valueA;
        this.stub(process, 'env', Object.assign(
          {},
          process.env,
          tempObj
        ));
        expect(() => {
          return bool(testKey);
        }).to.throw(ERROR_BOOL_VAL);
      }));

      it('throw an error if default value has not allowed value', sinon.test(function(){
        const bool = require(configPath).bool;
        if(process.env[testKey]){
          this.stub(process, 'env', _.omit(process.env, testKey));
        }

        expect(() => {
          return bool(testKey, valueA);
        }).to.throw(ERROR_BOOL_VAL);
      }));

      it('assign boolean value from environment variable if only environment variable is provided and environment variable is defined', sinon.test(function(){
        const bool = require(configPath).bool;
        const tempObj = {};
        tempObj[testKey] = 'true';
        this.stub(process, 'env', Object.assign(
          {},
          process.env,
          tempObj
        ));

        const value = bool(testKey);
        expect(value).to.equal(true);
      }));

      it('assign boolean value from environment variable if both environment variable and default value are provided and environment variable is defined', sinon.test(function(){
        const bool = require(configPath).bool;
        const tempObj = {};
        tempObj[testKey] = 'true';
        this.stub(process, 'env', Object.assign(
          {},
          process.env,
          tempObj
        ));

        const value = bool(testKey, false);
        expect(value).to.equal(true);
      }));

      it('assign boolean value from default value if both environment variable and default value are provided and environment variable is not defined', sinon.test(function(){
        const bool = require(configPath).bool;
        if(process.env[testKey]){
          this.stub(process, 'env', _.omit(process.env, testKey));
        }

        const temp = bool(testKey, 'false');
        const tempB = bool(testKey, false);
        expect(temp).to.equal(false);
        expect(tempB).to.equal(false);
      }));

      it('throw an error if only environment variable is provided and environment variable is not defined', sinon.test(function(){
        const bool = require(configPath).bool;
        if(process.env[testKey]){
          this.stub(process, 'env', _.omit(process.env, testKey));
        }

        expect(() => {
          return bool(testKey);
        }).to.throw(ERROR_BOOL_VAL);
      }));
    });
  });
});
