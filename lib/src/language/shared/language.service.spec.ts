import { TestBed, inject } from '@angular/core/testing';
import { TranslateModule } from 'ng2-translate';

import { IgoTestModule } from '../../../test/module';

import { LanguageService } from './language.service';


describe('LanguageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoTestModule,
        TranslateModule
      ],
      providers: []
    });
  });

  it('should ...', inject([LanguageService], (service: LanguageService) => {
    expect(service).toBeTruthy();
  }));
});
