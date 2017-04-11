import { MissingTranslationHandler,
         MissingTranslationHandlerParams } from 'ng2-translate';

export class IgoMissingTranslationHandler
  implements MissingTranslationHandler {

  handle(params: MissingTranslationHandlerParams) {
    console.log(`The Key "${params.key}" is missing in locale file.`);
    // throw new Error(`The Key "${params.key}" is missing in locale file.`);
  }
}
