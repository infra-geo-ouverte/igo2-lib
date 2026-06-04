import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export enum IgoLanguagePackage {
  Core = 'core',
  Auth = 'auth',
  Common = 'common',
  Geo = 'geo',
  Context = 'context',
  Integration = 'integration'
}

export const IGO_LANGUAGE_PACKAGES: readonly IgoLanguagePackage[] = [
  IgoLanguagePackage.Core,
  IgoLanguagePackage.Auth,
  IgoLanguagePackage.Common,
  IgoLanguagePackage.Geo,
  IgoLanguagePackage.Context,
  IgoLanguagePackage.Integration
];

export type LanguagePackage = IgoLanguagePackage | (string & {});

export interface LanguageOptions {
  prefix?: string | string[];
  appPrefix?: string | string[];
  packages?: LanguagePackage[];
  packageBasePath?: string;
}

export abstract class LanguageLoaderBase implements TranslateLoader {
  abstract isLoaded$: Observable<boolean>;
  abstract getTranslation(lang: string): Observable<TranslationObject>;
}

export type Translation =
  | string
  | Translation[]
  | TranslationObject

  // required to prevent error "Type instantiation is excessively deep and possibly infinite."
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | any;

// using Record<> does not work because TS does not support recursive definitions
export interface TranslationObject {
  [key: string]: Translation;
}
