export class ObjectUtils {
  static resolve(obj: object, key: string): any {
    const keysArray = key
      .replace(/\[/g, '.')
      .replace(/\]/g, '')
      .split('.');
    let current = obj;
    while (keysArray.length) {
      if (typeof current !== 'object') {
        return undefined;
      }
      current = current[keysArray.shift()];
    }

    return current;
  }

  static isObject(item: object) {
    return (
      item &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      item !== null &&
      !(item instanceof Date)
    );
  }

  static mergeDeep(
    target: object,
    source: object,
    ignoreUndefined = false
  ): any {
    const output = Object.assign({}, target);
    if (ObjectUtils.isObject(target) && ObjectUtils.isObject(source)) {
      Object.keys(source)
        .filter(key => !ignoreUndefined || source[key] !== undefined)
        .forEach(key => {
          if (ObjectUtils.isObject(source[key])) {
            if (!(key in target)) {
              Object.assign(output, { [key]: source[key] });
            } else {
              output[key] = ObjectUtils.mergeDeep(
                target[key],
                source[key],
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

  static copyDeep(src): any {
    const target = Array.isArray(src) ? [] : {};
    for (const prop in src) {
      if (src.hasOwnProperty(prop)) {
        const value = src[prop];
        if (value && typeof value === 'object') {
          target[prop] = this.copyDeep(value);
        } else {
          target[prop] = value;
        }
      }
    }
    return target;
  }

  static removeDuplicateCaseInsensitive(obj: object) {
    const summaryCapitalizeObject = {};
    const capitalizeObject = {};
    const upperCaseCount = [];

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
        // counting the number of uppercase lettersMna
        upperCaseCount.push({
          key: property,
          count: property.replace(/[^A-Z]/g, '').length
        });
      }
    }
    for (const capitalizedProperty in summaryCapitalizeObject) {
      if (summaryCapitalizeObject.hasOwnProperty(capitalizedProperty)) {
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
                f => f.key.toLowerCase() === capitalizedProperty.toLowerCase()
              )
              .reduce((prev, current) => {
                return prev.y < current.y ? prev : current;
              });
            capitalizeObject[paramClosestToLowercase.key.toUpperCase()] =
              obj[paramClosestToLowercase.key];
          }
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

  static removeUndefined(obj: object): any {
    const output = {};
    if (ObjectUtils.isObject(obj)) {
      Object.keys(obj)
        .filter(key => obj[key] !== undefined)
        .forEach(key => {
          if (ObjectUtils.isObject(obj[key]) || Array.isArray(obj[key])) {
            output[key] = ObjectUtils.removeUndefined(obj[key]);
          } else {
            output[key] = obj[key];
          }
        });

      return output;
    }

    if (Array.isArray(obj)) {
      return obj.map(o => ObjectUtils.removeUndefined(o));
    }

    return obj;
  }

  static removeNull(obj: object): any {
    const output = {};
    if (ObjectUtils.isObject(obj)) {
      Object.keys(obj)
        .filter(key => obj[key] !== null)
        .forEach(key => {
          if (ObjectUtils.isObject(obj[key]) || Array.isArray(obj[key])) {
            output[key] = ObjectUtils.removeNull(obj[key]);
          } else {
            output[key] = obj[key];
          }
        });

      return output;
    }

    if (Array.isArray(obj)) {
      return obj.map(o => ObjectUtils.removeNull(o));
    }

    return obj;
  }

  static naturalCompare(a, b, direction = 'asc', nullsFirst?: boolean) {
    if (direction === 'desc') {
      b = [a, (a = b)][0];
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

    const ax = [];
    const bx = [];
    a = '' + a;
    b = '' + b;

    a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
      ax.push([$1 || Infinity, $2 || '']);
    });

    b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
      bx.push([$1 || Infinity, $2 || '']);
    });

    while (ax.length && bx.length) {
      const an = ax.shift();
      const bn = bx.shift();
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
   * @returns Whether two objects arer equivalent
   */
  static objectsAreEquivalent(obj1: object, obj2: object): boolean {
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
  static removeKeys(obj: object, keys: string[]): object {
    const newObj = Object.keys(obj)
      .filter(key => keys.indexOf(key) < 0)
      .reduce((_obj, key) => {
        _obj[key] = obj[key];
        return _obj;
      }, {});

    return newObj;
  }

  static isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }

  static isNotEmpty(obj: object): boolean {
    return !ObjectUtils.isEmpty(obj);
  }
}
