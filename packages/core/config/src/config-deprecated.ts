import { AlternateConfigOptions, DeprecatedOptions } from './config.interface';

export const CONFIG_DEPRECATED: Record<string, DeprecatedOptions> = {};

export const ALTERNATE_CONFIG_FROM_DEPRECATION = new Map<
  string,
  AlternateConfigOptions
>(
  Object.entries(CONFIG_DEPRECATED)
    .filter(([_, options]) => options.alternativeKey)
    .map(
      ([key, options]) =>
        [
          options.alternativeKey!,
          {
            deprecatedKey: key
          } satisfies AlternateConfigOptions
        ] as const
    )
);
