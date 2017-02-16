'use strict';

const ERROR_MISSING_ENV = 'Missing Environment Variables';
const ERROR_BOOL_VAL = 'Not allowed boolean value';
const missingEnvs = [];

function env(key, defaultValue) {
  if (process.env[key] !== undefined) {
    return process.env[key];
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  missingEnvs.push(key);
  return undefined;
}

function bool(key, defaultValue) {
  const value = env(key, defaultValue);
  if ([true, false].indexOf(value) !== -1) {
    return value;
  } else if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  }
  throw new Error(ERROR_BOOL_VAL);
}

function check() {
  if (missingEnvs.length > 0) {
    const err = new Error(`${ERROR_MISSING_ENV} [${missingEnvs.join(', ')}]`);
    err.missingEnvs = missingEnvs;
    throw err;
  }
}

module.exports = {
  env,
  bool,
  check,
  ERROR_MISSING_ENV,
  ERROR_BOOL_VAL,
};
