/* eslint-disable no-prototype-builtins */
export class ObjectUtils {
  static resolve<T, K extends keyof T>(obj: T, key: K | string): unknown {
    const keysArray = String(key)
      .replace(/\[/g, '.')
      .replace(/\]/g, '')
      .split('.');
    let current: unknown = obj;
    let value: unknown = undefined;
    while (keysArray.length) {
      if (typeof current !== 'object' || current === null) {
        return undefined;
      }
      const k = keysArray.shift() as string;
      value = current = (current as Record<string, unknown>)[k];
    }

    return value;
  }

  static isObject(item: unknown): item is Record<string, unknown> {
    return (
      !!item &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      item !== null &&
      !(item instanceof Date)
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static mergeDeep<T = any>(
    target: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source: any,
    ignoreUndefined = false
  ): T {
    const output = Object.assign({}, target);
    if (ObjectUtils.isObject(target) && ObjectUtils.isObject(source)) {
      Object.keys(source)
        .filter((key) => !ignoreUndefined || source[key] !== undefined)
        .forEach((key) => {
          if (ObjectUtils.isObject(source[key])) {
            if (!(key in target)) {
              Object.assign(output, { [key]: source[key] });
            } else {
              (output as Record<string, unknown>)[key] = ObjectUtils.mergeDeep(
                target[key] as Record<string, unknown>,
                source[key] as Record<string, unknown>,
                ignoreUndefined
              );
            }
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
    }
    return output;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static copyDeep<T = any>(src: T): T {
    if (Array.isArray(src)) {
      return src.map((item) =>
        typeof item === 'object' && item !== null
          ? this.copyDeep(item as Record<string, unknown>)
          : item
      ) as T;
    } else if (this.isObject(src)) {
      const target = {} as T;
      for (const prop in src) {
        if (src.hasOwnProperty(prop)) {
          const value = (src as Record<string, unknown>)[prop];
          (target as Record<string, unknown>)[prop] =
            value && typeof value === 'object'
              ? this.copyDeep(value as Record<string, unknown>)
              : value;
        }
      }
      return target;
    }
    return src;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static removeDuplicateCaseInsensitive(obj: any) {
    const summaryCapitalizeObject: Record<string, { [k: string]: unknown }[]> =
      {};
    const capitalizeObject: Record<string, unknown> = {};
    const upperCaseCount: { key: string; count: number }[] = [];

    for (const property in obj) {
      if (obj.hasOwnProperty(property)) {
        const upperCaseProperty = property.toUpperCase();
        if (!summaryCapitalizeObject.hasOwnProperty(upperCaseProperty)) {
          summaryCapitalizeObject[upperCaseProperty] = [
            { [property]: obj[property] }
          ];
        } else {
          summaryCapitalizeObject[upperCaseProperty].push({
            [property]: obj[property]
          });
        }
        // counting the number of uppercase letters
        upperCaseCount.push({
          key: property,
          count: property.replace(/[^A-Z]/g, '').length
        });
      }
    }
    for (const capitalizedProperty in summaryCapitalizeObject) {
      if (summaryCapitalizeObject.hasOwnProperty(capitalizedProperty)) {
        const capitalizedPropertyObject =
          summaryCapitalizeObject[capitalizedProperty];
        if (capitalizedPropertyObject.length === 1) {
          // for single params (no duplicates)
          const singlePossibility = capitalizedPropertyObject[0];
          capitalizeObject[capitalizedProperty] =
            singlePossibility[Object.keys(singlePossibility)[0]];
        } else if (capitalizedPropertyObject.length > 1) {
          // defining the closest to lowercase property
          const paramClosestToLowercase = upperCaseCount
            .filter(
              (f) => f.key.toLowerCase() === capitalizedProperty.toLowerCase()
            )
            .reduce((prev, current) => {
              return prev.count < current.count ? prev : current;
            });
          capitalizeObject[paramClosestToLowercase.key.toUpperCase()] =
            obj[paramClosestToLowercase.key];
        }
      }
    }
    for (const property in obj) {
      if (obj.hasOwnProperty(property)) {
        delete obj[property];
      }
    }

    for (const property in capitalizeObject) {
      if (capitalizeObject.hasOwnProperty(property)) {
        obj[property] = capitalizeObject[property];
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static removeUndefined<T = any>(obj: T): T {
    if (Array.isArray(obj)) {
      return obj
        .filter((item) => item !== undefined)
        .map((item) =>
          typeof item === 'object'
            ? ObjectUtils.removeUndefined(item as Record<string, unknown>)
            : item
        ) as T;
    }

    if (ObjectUtils.isObject(obj)) {
      const output: Record<string, unknown> = {};
      Object.keys(obj)
        .filter((key) => obj[key] !== undefined)
        .forEach((key) => {
          output[key] =
            typeof obj[key] === 'object'
              ? ObjectUtils.removeUndefined(obj[key] as Record<string, unknown>)
              : obj[key];
        });
      return output as T;
    }

    return obj;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static removeNull<T = any>(obj: T): T {
    if (Array.isArray(obj)) {
      return obj
        .filter((item) => item !== null)
        .map((item) =>
          typeof item === 'object'
            ? ObjectUtils.removeNull(item as Record<string, unknown>)
            : item
        ) as T;
    }

    if (ObjectUtils.isObject(obj)) {
      const output: Record<string, unknown> = {};
      Object.keys(obj)
        .filter((key) => obj[key] !== null)
        .forEach((key) => {
          if (ObjectUtils.isObject(obj[key]) || Array.isArray(obj[key])) {
            output[key] = ObjectUtils.removeNull(
              obj[key] as Record<string, unknown>
            );
          } else {
            output[key] = obj[key];
          }
        });

      return output as T;
    }

    return obj;
  }

  static naturalCompare(
    a: unknown,
    b: unknown,
    direction = 'asc',
    nullsFirst?: boolean
  ): number {
    if (direction === 'desc') {
      [a, b] = [b, a];
    }

    // nullsFirst = undefined : end if direction = 'asc', first if direction = 'desc'
    // nullsFirst = true : always first
    // nullsFirst = false : always end
    if (
      a === null ||
      a === '' ||
      a === undefined ||
      b === null ||
      b === '' ||
      b === undefined
    ) {
      const nullScore =
        a === b
          ? 0
          : a === undefined
            ? 3
            : b === undefined
              ? -3
              : a === null
                ? 2
                : b === null
                  ? -2
                  : a === ''
                    ? 1
                    : -1;
      if (direction === 'desc') {
        return nullsFirst !== false ? nullScore : nullScore * -1;
      }
      return nullsFirst === true ? nullScore * -1 : nullScore;
    }

    const ax: [number, string][] = [];
    const bx: [number, string][] = [];
    const aStr = '' + a;
    const bStr = '' + b;

    aStr.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
      ax.push([$1 ? Number($1) : Infinity, $2 ?? '']);
      return '';
    });

    bStr.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
      bx.push([$1 ? Number($1) : Infinity, $2 ?? '']);
      return '';
    });

    while (ax.length && bx.length) {
      const an = ax.shift()!;
      const bn = bx.shift()!;
      const nn = an[0] - bn[0] || an[1].localeCompare(bn[1]);
      if (nn) {
        return nn;
      }
    }

    return ax.length - bx.length;
  }

  /**
   * Return true if two object are equivalent.
   * Objects are considered equivalent if they have the same properties and
   * if all of their properties (first-level only) share the same value.
   * @param obj1 First object
   * @param obj2 Second object
   * @returns Whether two objects are equivalent
   */
  static objectsAreEquivalent(
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>
  ): boolean {
    if (obj1 === obj2) {
      return true;
    }

    const obj1Props = Object.getOwnPropertyNames(obj1);
    const obj2Props = Object.getOwnPropertyNames(obj2);
    if (obj1Props.length !== obj2Props.length) {
      return false;
    }

    for (const prop of obj1Props) {
      if (obj1[prop] !== obj2[prop]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Return a new object with an array of keys removed
   * @param obj Source object
   * @param keys Keys to remove
   * @returns A new object
   */
  static removeKeys(
    obj: Record<string, unknown>,
    keys: string[]
  ): Record<string, unknown> {
    return Object.keys(obj)
      .filter((key) => keys.indexOf(key) < 0)
      .reduce<Record<string, unknown>>((_obj, key) => {
        _obj[key] = obj[key];
        return _obj;
      }, {});
  }

  static isEmpty(obj: Record<string, unknown>): boolean {
    return Object.keys(obj).length === 0;
  }
}
