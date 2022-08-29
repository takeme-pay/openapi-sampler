import { traverse, clearCache } from './traverse';
import { sampleArray, sampleBoolean, sampleNumber, sampleObject, sampleString } from './samplers/index';
import {toXML} from 'to-xml';

export var _samplers = {};

const defaults = {
  skipReadOnly: false,
  maxSampleDepth: 15,
};

export function sample(schema, options, spec, context) {
  let opts = Object.assign({}, defaults, options);
  clearCache();
  const value = traverse(schema, opts, spec, context).value;
  if (options.format === 'xml') {
    return toXML(value, null, 2);
  }
  return value;
};

export function _registerSampler(type, sampler) {
  _samplers[type] = sampler;
};

export { inferType } from './infer';

_registerSampler('array', sampleArray);
_registerSampler('boolean', sampleBoolean);
_registerSampler('integer', sampleNumber);
_registerSampler('number', sampleNumber);
_registerSampler('object', sampleObject);
_registerSampler('string', sampleString);
