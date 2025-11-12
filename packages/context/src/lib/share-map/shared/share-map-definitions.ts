import {
  ServiceTypeEnum,
  ShareMapKeysDefinitions,
  ShareMapRouteKeysOptions
} from './share-map.interface';

export function shareMapKeyDefs(
  options: ShareMapRouteKeysOptions
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
          parse: (params) => parseIntergerParam(params, options.zoom)
        },
        center: {
          key: '@',
          parse: parseCenter,
          stringify: stringifyCenter
        },
        rotation: {
          key: options.rotation,
          parse: (params) => parseRotation(params, options.rotation),
          stringify: formatNumber
        },
        projection: {
          key: options.projection,
          parse: (params) => extractParam(params, options.projection)
        }
      }
    },
    layers: {
      key: options.layers,
      params: {
        index: undefined,
        id: {
          key: 'id',
          parse: (params) => extractParam(params, 'id'),
          stringify: (value: string) => `${value}`
        },
        names: {
          key: 'n',
          parse: (params) => extractParam(params, 'n'),
          stringify: (value: string) => `[${value}]`
        },
        opacity: {
          key: 'o',
          parse: (params) => parseFloatParam(params, 'o')
        },
        visible: {
          key: 'v',
          parse: (params) => parseBooleanParam(params, 'v'),
          stringify: stringifyBoolean
        },
        type: {
          key: 't',
          parse: (params) => parseLayerType(params, 't'),
          stringify: stringifyType
        },
        zIndex: {
          key: 'z',
          parse: (params) => parseIntergerParam(params, 'z')
        },
        parentId: {
          key: 'pid',
          parse: (params) => extractParam(params, 'pid')
        },
        version: {
          key: 'vrn',
          parse: (params) => extractParam(params, 'vrn')
        },
        queryString: {
          key: 'q',
          parse: (params) => extractParam(params, 'q')
        }
      }
    },
    groups: {
      key: options.groups,
      params: {
        id: {
          key: 'id',
          parse: (params) => extractIdParam(params, 'id')
        },
        parentId: {
          key: 'pid',
          parse: (params) => extractIdParam(params, 'pid')
        },
        title: { key: 't', parse: (params) => extractParam(params, 't') },
        visible: {
          key: 'v',
          parse: (params) => parseBooleanParam(params, 'v'),
          stringify: stringifyBoolean
        },
        opacity: {
          key: 'o',
          parse: (params) => parseFloatParam(params, 'o')
        },
        zIndex: {
          key: 'z',
          parse: (params) => parseIntergerParam(params, 'z')
        },
        expanded: {
          key: 'e',
          parse: (params) => parseBooleanParam(params, 'e'),
          stringify: stringifyBoolean
        }
      }
    }
  };
}

function stringifyBoolean(value: boolean): string {
  return value ? '1' : '0';
}

function parseBoolean(params: string): boolean {
  return !!parseInt(params);
}

function stringifyType(value: keyof typeof ServiceTypeEnum): string {
  return String(ServiceTypeEnum[value]);
}

function parseLayerType(
  params: string,
  key: string
): keyof typeof ServiceTypeEnum {
  const param = extractParam(params, key);
  if (!param) {
    return;
  }
  const type = Number(param);

  return ServiceTypeEnum[type] as keyof typeof ServiceTypeEnum;
}

function stringifyCenter(values: [number, number]): string {
  return values.map(formatNumber).join(',');
}

function parseCenter(params: string | undefined): [number, number] | undefined {
  if (!params?.startsWith('@')) {
    return;
  }
  const paramsSplitted = params.split(',');
  const index = paramsSplitted.findIndex((param) => param.startsWith('@'));
  return [
    Number(paramsSplitted[index].slice(1)),
    Number(paramsSplitted[index + 1])
  ];
}

function parseRotation(params: string | undefined, key: string): number {
  const param = extractParam(params, key);
  if (!param) {
    return;
  }
  const degree = parseInteger(param);
  return (degree * Math.PI) / 180;
}

function parseIntergerParam(params: string | undefined, key: string): number {
  const param = extractParam(params, key);
  if (!param) {
    return;
  }
  return parseInteger(param);
}

function parseBooleanParam(params: string | undefined, key: string): boolean {
  const param = extractParam(params, key);
  if (!param) {
    return;
  }
  return parseBoolean(param);
}

function parseFloatParam(params: string | undefined, key: string): number {
  const param = extractParam(params, key);
  if (!param) {
    return;
  }
  return parseFloat(param);
}

function extractParam(
  params: string | undefined,
  suffix: string
): string | undefined {
  return params
    ?.split(',')
    .find((param) => param.endsWith(suffix))
    ?.slice(0, -suffix.length);
}

function extractIdParam(
  params: string,
  suffix: 'id' | 'pid'
): string | undefined {
  const paramsSplited = params.split(',');
  // Find the parameter that ends with exact id/pid and isn't part of another word
  const param = paramsSplited.find((param) => {
    const key = param.slice(-suffix.length);

    if (key !== suffix) {
      return false;
    }

    if (suffix === 'pid') {
      return true;
    }

    const prefixChar = param.slice(-suffix.length - 1, -suffix.length);
    return prefixChar !== 'p';
  });
  return param?.slice(0, -suffix.length);
}

function parseInteger(value: string) {
  return parseInt(value, 10);
}

function formatNumber(value: number) {
  return value.toFixed(5).replace(/\.([^0]+)0+$/, '.$1');
}
