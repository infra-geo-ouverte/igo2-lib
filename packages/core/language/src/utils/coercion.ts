import { ObjectUtils } from '@igo2/utils';

import { Translation, TranslationObject } from '../shared/language.interface';

export function labelAttribute(
  value: Translation | TranslationObject | undefined,
  defaultValue: Translation | TranslationObject = {}
): Translation | TranslationObject {
  if (isTranslationObject(value) && isTranslationObject(defaultValue)) {
    return ObjectUtils.mergeDeep(defaultValue, value);
  }

  return value ?? defaultValue;
}

function isTranslationObject(value: unknown): value is TranslationObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
