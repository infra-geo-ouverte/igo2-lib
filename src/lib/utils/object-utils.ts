export class ObjectUtils {
  static resolve(obj: Object, key: string): any {
    const keysArray = key.split('.');
    let current = obj;
    while (keysArray.length) {
        if (typeof current !== 'object') {
          return undefined;
        }
        current = current[keysArray.shift()];
    }

    return current;
  }
}
