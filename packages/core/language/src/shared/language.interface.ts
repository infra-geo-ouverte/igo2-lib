import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export interface LanguageOptions {
  prefix?: string | string[];
  ignoreLibsLocale?: boolean;
}

export abstract class LanguageLoaderBase implements TranslateLoader {
  abstract isLoaded$: Observable<boolean>;
  abstract getTranslation(lang: string): Observable<any>;
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
