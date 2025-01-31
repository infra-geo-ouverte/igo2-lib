import { contextRouteKeysOptions } from '../../context-manager/shared/context.interface';
import {
  ServiceTypeEnum,
  ShareMapKeysDefinitions
} from './share-map.interface';

export function shareMapKeyDefs(
  options: contextRouteKeysOptions
): ShareMapKeysDefinitions {
  return {
    contextKey: options.context,
    urlsKey: options.urls,
    languageKey: options.languageKey,
    pos: {
      key: options.position,
      params: {
        zoom: {
          key: options.zoom,
          parse: parseNumber,
          get regex(): RegExp {
            return new RegExp(`(-?\\d+)${this.key}`);
          }
        },
        center: {
          key: '@',
          parse: parseCenter,
          stringify: stringifyCenter,
          get regex(): RegExp {
            return new RegExp(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          }
        },
        rotation: {
          key: options.rotation,
          stringify: formatNumber,
          parse: (value) => parseFloat(value),
          get regex(): RegExp {
            return new RegExp(`([\\d.]+)${this.key}`);
          }
        },
        projection: {
          key: options.projection,
          get regex(): RegExp {
            return new RegExp(`([^,]+)${this.key}`);
          }
        }
      }
    },
    layers: {
      key: options.layers,
      params: {
        index: undefined,
        names: {
          key: 'n',
          parse: (value) => value,
          stringify: (value: string) => `[${value}]`
        },
        opacity: {
          key: 'o',
          parse: (value) => parseFloat(value)
        },
        visible: {
          key: 'v',
          parse: parseBoolean,
          stringify: stringifyBoolean
        },
        type: {
          key: 't',
          parse: parseType,
          stringify: stringifyType
        },
        zIndex: { key: 'z', parse: parseNumber },
        parentId: { key: 'pid' },
        version: {
          key: 'vrn',
          get regex(): RegExp {
            return new RegExp(`[?&]${this.key}=([^&]*)`);
          }
        },
        queryString: { key: 'q' }
      }
    },
    groups: {
      key: options.groups,
      params: {
        id: { key: 'id' },
        parentId: { key: 'pid' },
        title: { key: 't' },
        visible: { key: 'v' },
        opacity: { key: 'o' },
        zIndex: { key: 'z' }
      }
    }
  };
}

function stringifyBoolean(value: boolean): string {
  return value ? '1' : '0';
}

function parseBoolean(value: string): boolean {
  return !!parseInt(value);
}

function stringifyType(value: keyof typeof ServiceTypeEnum): string {
  return String(ServiceTypeEnum[value]);
}

function parseType(value: string): keyof typeof ServiceTypeEnum {
  const numValue = Number(value);
  return ServiceTypeEnum[numValue] as keyof typeof ServiceTypeEnum;
}

function stringifyCenter(values: [number, number]): string {
  return values.map(formatNumber).join(',');
}

function parseCenter(value: string): [number, number] {
  return value.startsWith('@')
    ? (value.slice(1).split(',').map(Number) as [number, number])
    : (value.split(',').map(Number) as [number, number]);
}

function parseNumber(value: string) {
  return parseInt(value, 10);
}

function formatNumber(value: number) {
  return value.toFixed(5).replace(/\.([^0]+)0+$/, '.$1');
}
