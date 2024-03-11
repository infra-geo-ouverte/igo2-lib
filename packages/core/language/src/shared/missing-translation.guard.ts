import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams
} from '@ngx-translate/core';

export class IgoMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    if (!params.translateService.langs.length) {
      const error =
        'Translations are not yet loaded. \
         Check that the LanguageService is injected.';
      throw new Error(error);
    }

    if (params.key.substr(0, 4) === 'igo.') {
      throw new Error(`The Key "${params.key}" is missing in locale file.`);
    } else {
      return params.key;
    }
  }
}
