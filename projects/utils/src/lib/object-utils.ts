export class ObjectUtils {
  static resolve(obj: Object, key: string): any {
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

  static isObject(item: Object) {
    return (
      item &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      item !== null &&
      !(item instanceof Date)
    );
  }

  static mergeDeep(
    target: Object,
    source: Object,
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

  static removeUndefined(obj: Object): any {
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

  static removeNull(obj: Object): any {
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

  static naturalCompare(a, b, direction = 'asc', nullFirst = false) {
    if (direction === 'desc') {
      b = [a, (a = b)][0];
    }

    if (a === undefined || a === null || a === '') {
      if (direction === 'desc') {
        return nullFirst ? -1 : 1;
      }
      return nullFirst ? 1 : -1;
    }
    if (b === undefined || b === null || b === '') {
      if (direction === 'desc') {
        return nullFirst ? 1 : -1;
      }
      return nullFirst ? -1 : 1;
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

    for (let i = 0; i < obj1Props.length; i++) {
      const prop = obj1Props[i];
      if (obj1[prop] !== obj2[prop]) {
        return false;
      }
    }

    return true;
  }
}
