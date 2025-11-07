import { AlternateConfigOptions, DeprecatedOptions } from './config.interface';

export const CONFIG_DEPRECATED: Record<string, DeprecatedOptions> = {
  showMenuButton: {
    alternativeKey: 'menu.button.visible',
    mayBeRemoveIn: new Date('2024-06-06')
  },
  menuButtonReverseColor: {
    alternativeKey: 'menu.button.useThemeColor',
    mayBeRemoveIn: new Date('2024-06-06')
  },
  importWithStyle: {
    alternativeKey: 'importExport.importWithStyle',
    mayBeRemoveIn: new Date('2024-06-06')
  },
  hasGeolocateButton: {
    alternativeKey: 'geolocate.button.visible',
    mayBeRemoveIn: new Date('2024-06-06')
  }
};

export const ALTERNATE_CONFIG_FROM_DEPRECATION = new Map<
  string,
  AlternateConfigOptions
>(
  Object.entries(CONFIG_DEPRECATED)
    .filter(([_, options]) => options.alternativeKey)
    .map(([key, options]) => [
      options.alternativeKey,
      {
        deprecatedKey: key
      } satisfies AlternateConfigOptions
    ])
);
