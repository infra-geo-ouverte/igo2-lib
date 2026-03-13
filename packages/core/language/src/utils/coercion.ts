import { Translation, TranslationObject } from '../shared/language.interface';

export function labelAttribute(
  value: Translation | TranslationObject | undefined,
  defaultValue: Translation | TranslationObject = {}
): Translation | TranslationObject {
  return { ...defaultValue, ...(value ?? {}) };
}
