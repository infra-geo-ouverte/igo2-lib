import { ChangeType, GroupingChanges } from './change.interface';
import { StringUtils } from './string-utils';

export class ChangeUtils {
  static findChanges(
    obj1: any[],
    obj2: any[],
    ignoreKeys: string[] = []
  ): GroupingChanges {
    const items: GroupingChanges = {
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
      const index = obj2Clone.findIndex((s) => s.id === fromItem.id);

      if (index === -1) {
        items.deleted.push({
          change: { type: ChangeType.DELETED },
          value: fromItem
        });
        continue;
      }

      const toItem = obj2Clone.splice(index, 1)[0];
      const fromItemClone = JSON.parse(JSON.stringify(fromItem));
      const toItemClone = JSON.parse(JSON.stringify(toItem));

      const keysChanged = ChangeUtils.compareObject(
        fromItemClone,
        toItemClone,
        undefined,
        ignoreKeys
      );

      if (keysChanged.length) {
        items.modified.push({
          change: {
            type: ChangeType.MODIFIED,
            keysChanged
          },
          value: fromItemClone,
          oldValue: fromItem,
          newValue: toItem
        });
      }
    }

    items.added = obj2Clone.map((itemAdded) => {
      return {
        change: { type: ChangeType.ADDED },
        value: itemAdded
      };
    });

    return items;
  }

  private static compareObject(fromItem, toItem, baseKey?, ignoreKeys = []) {
    const fromItemClone = JSON.parse(JSON.stringify(fromItem));
    const toItemClone = JSON.parse(JSON.stringify(toItem));

    const keys: any = new Set([
      ...Object.keys(fromItem),
      ...Object.keys(toItem)
    ]);
    let keysChanged = [];
    keys.forEach((key) => {
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
