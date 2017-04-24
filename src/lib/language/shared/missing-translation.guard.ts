import { MissingTranslationHandler,
         MissingTranslationHandlerParams } from '@ngx-translate/core';

export class IgoMissingTranslationHandler
  implements MissingTranslationHandler {

  handle(params: MissingTranslationHandlerParams) {
    if (!params.translateService.langs.length) {
        throw new Error(`LanguageService must be injected.`);
    }
    throw new Error(`The Key "${params.key}" is missing in locale file.`);
  }
}
