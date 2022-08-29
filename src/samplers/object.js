import { traverse } from '../traverse';
export function sampleObject(schema, options = {}, spec, context) {
  let res = {};
  const depth = (context && context.depth || 1);

  if (schema && typeof schema.properties === 'object') {
    let requiredKeys = (Array.isArray(schema.required) ? schema.required : []);
    let requiredKeyDict = requiredKeys.reduce((dict, key) => {
      dict[key] = true;
      return dict;
    }, {});

    Object.keys(schema.properties).forEach(propertyName => {
      // skip before traverse that could be costly
      if (options.skipNonRequired && !requiredKeyDict.hasOwnProperty(propertyName)) {
        return;
      }

      let propertySchema = schema.properties[propertyName];
      const sample = traverse(propertySchema, options, spec, { propertyName, depth: depth + 1 });
      if (options.skipReadOnly && sample.readOnly) {
        return;
      }

      if (options.skipWriteOnly && sample.writeOnly) {
        return;
      }

      if (options.format === 'xml' && propertySchema.xml) {
        if (propertySchema.xml.name) {
          propertyName = propertySchema.xml.name;
        }
        if (propertySchema.xml.attribute) {
          propertyName = `@${propertyName}`;
        }
      }
      res[propertyName] = sample.value;
    });
  }

  if (schema && typeof schema.additionalProperties === 'object') {
    const propertyName = schema.additionalProperties['x-additionalPropertiesName'] || 'property';
    res[`${String(propertyName)}1`] = traverse(schema.additionalProperties, options, spec, {depth: depth + 1 }).value;
    res[`${String(propertyName)}2`] = traverse(schema.additionalProperties, options, spec, {depth: depth + 1 }).value;
  }

  if (options.format === 'xml') {
    let elementName = null;
    if (schema.xml && schema.xml.name) {
      elementName = schema.xml.name;
    } else if (context) {
      elementName = context.propertyName;
    }
    if (elementName) {
      return {[elementName]: res};
    }
  }

  return res;
}
