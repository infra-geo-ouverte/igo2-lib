import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export interface LanguageOptions {
  prefix?: string | string[];
}

export abstract class LanguageLoaderBase implements TranslateLoader {
  abstract isLoaded$: Observable<boolean>;
  abstract getTranslation(lang: string): Observable<any>;
}
