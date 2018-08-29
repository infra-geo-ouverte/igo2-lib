import { StringUtils } from './string-utils';
import { ModifRegroupement, ModifItem, ModifType } from './modif.interface';

export class ModifUtils {
  static findModifs(
    obj1: any[],
    obj2: any[],
    ignoreKeys: string[] = []
  ): ModifRegroupement {
    const items: ModifRegroupement = {
      added: [],
      deleted: [],
      modified: []
    };

    if (!obj1 || !obj2) {
      return items;
    }

    const obj1Clone: any = [...obj1];
    const obj2Clone: any = [...obj2];

    for (const fromItem of obj1Clone) {
      const index = obj2Clone.findIndex(s => s.id === fromItem.id);

      if (index === -1) {
        items.deleted.push({
          modif: { type: ModifType.DELETED },
          value: fromItem
        });
        continue;
      }

      const toItem = obj2Clone.splice(index, 1)[0];
      const fromItemClone = Object.assign({}, fromItem);
      const toItemClone = Object.assign({}, toItem);

      const keysChanged = ModifUtils.compareObject(
        fromItem,
        toItem,
        undefined,
        ignoreKeys
      );

      if (keysChanged.length) {
        items.modified.push({
          modif: {
            type: ModifType.MODIFIED,
            keysChanged: keysChanged
          },
          value: fromItem,
          oldValue: fromItemClone,
          newValue: toItemClone
        });
      }
    }

    items.added = obj2Clone.map(itemAdded => {
      return {
        modif: { type: ModifType.ADDED },
        value: itemAdded
      };
    });

    return items;
  }

  private static compareObject(fromItem, toItem, baseKey?, ignoreKeys = []) {
    const fromItemClone = Object.assign({}, fromItem);
    const toItemClone = Object.assign({}, toItem);

    const keys: any = new Set([
      ...Object.keys(fromItem),
      ...Object.keys(toItem)
    ]);
    let keysChanged = [];
    keys.forEach(key => {
      const keyString = baseKey ? `${baseKey}.${key}` : key;
      if (ignoreKeys.indexOf(keyString) !== -1) {
        return;
      }

      if (Array.isArray(fromItem[key])) {
        fromItem[key] = fromItem[key].join(',<br>');
      }
      if (Array.isArray(toItem[key])) {
        toItem[key] = toItem[key].join(',<br>');
      }

      if (
        typeof fromItem[key] === 'object' &&
        typeof toItem[key] === 'object' &&
        fromItem[key] !== null &&
        toItem[key] !== null
      ) {
        keysChanged = keysChanged.concat(
          this.compareObject(fromItem[key], toItem[key], keyString)
        );
      } else {
        if (fromItem[key] !== toItem[key]) {
          keysChanged.push({
            key: keyString,
            oldValue: fromItemClone[key],
            newValue: toItemClone[key]
          });
          fromItem[key] = StringUtils.diff(fromItem[key], toItem[key]);
        }
      }
    });

    return keysChanged;
  }
}
