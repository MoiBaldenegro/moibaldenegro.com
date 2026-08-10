import { readFileSync } from 'node:fs';

const FEATURE_LIST_PATH = new URL('../feature_list.json', import.meta.url);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

export function validateFeatureList() {
  const errors = [];
  const data = JSON.parse(readFileSync(FEATURE_LIST_PATH, 'utf8'));

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    errors.push('feature_list.json: debe ser un objeto con { project, description, rules, features }');
    return errors;
  }

  if (!isNonEmptyString(data.project)) {
    errors.push('feature_list.json: "project" debe ser un texto no vacío');
  }
  if (!isNonEmptyString(data.description)) {
    errors.push('feature_list.json: "description" debe ser un texto no vacío');
  }

  const rules = data.rules;
  if (typeof rules !== 'object' || rules === null) {
    errors.push('feature_list.json: falta el objeto "rules"');
    return errors;
  }
  if (typeof rules.one_feature_at_a_time !== 'boolean') {
    errors.push('feature_list.json: rules.one_feature_at_a_time debe ser boolean');
  }
  if (typeof rules.require_tests_to_close !== 'boolean') {
    errors.push('feature_list.json: rules.require_tests_to_close debe ser boolean');
  }
  if (
    !Array.isArray(rules.valid_status) ||
    rules.valid_status.length === 0 ||
    !rules.valid_status.every(isNonEmptyString)
  ) {
    errors.push('feature_list.json: rules.valid_status debe ser un array de textos');
  }

  if (!Array.isArray(data.features)) {
    errors.push('feature_list.json: "features" debe ser un array');
    return errors;
  }

  const validStatuses = Array.isArray(rules.valid_status) ? rules.valid_status : [];
  const ids = new Set();
  data.features.forEach((feature, index) => {
    if (typeof feature !== 'object' || feature === null) {
      errors.push(`feature_list.json: features[${index}] debe ser un objeto`);
      return;
    }
    if (typeof feature.id !== 'number' || !Number.isInteger(feature.id)) {
      errors.push(`feature_list.json: features[${index}].id debe ser un entero`);
    } else if (ids.has(feature.id)) {
      errors.push(`feature_list.json: features[${index}].id duplicado`);
    } else {
      ids.add(feature.id);
    }
    if (!isNonEmptyString(feature.name)) {
      errors.push(`feature_list.json: features[${index}].name debe ser un texto no vacío`);
    }
    if (!isNonEmptyString(feature.title)) {
      errors.push(`feature_list.json: features[${index}].title debe ser un texto no vacío`);
    }
    if (!isNonEmptyString(feature.description)) {
      errors.push(`feature_list.json: features[${index}].description debe ser un texto no vacío`);
    }
    if (
      !Array.isArray(feature.acceptance) ||
      feature.acceptance.length === 0 ||
      !feature.acceptance.every(isNonEmptyString)
    ) {
      errors.push(`feature_list.json: features[${index}].acceptance debe ser un array de textos no vacío`);
    }
    if (!validStatuses.includes(feature.status)) {
      errors.push(
        `feature_list.json: features[${index}].status inválido "${feature.status}" (válidos: ${validStatuses.join(', ')})`,
      );
    }
  });

  return errors;
}
