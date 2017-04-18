import { TestBed, inject } from '@angular/core/testing';
import { TranslateModule, MissingTranslationHandler,
         TranslateService } from '@ngx-translate/core';

import { IgoTestModule } from '../../../test/module';

import { LanguageService } from './language.service';
import { IgoMissingTranslationHandler } from './missing-translation.guard';


describe('LanguageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoTestModule,
        TranslateModule.forRoot({
          missingTranslationHandler: {
            provide: MissingTranslationHandler,
            useClass: IgoMissingTranslationHandler
          }
        })
      ],
      providers: [ TranslateService ]
    });
  });

  it('should ...', inject([LanguageService], (service: LanguageService) => {
    expect(service).toBeTruthy();
  }));
});
