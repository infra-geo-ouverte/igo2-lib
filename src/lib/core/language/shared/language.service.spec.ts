import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { TranslateModule } from '@ngx-translate/core';

import { IgoTestModule } from '../../../../test/module';

import { LanguageService } from './language.service';


describe('LanguageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        IgoTestModule,
        TranslateModule
      ]
    });
  });

  it('should ...', inject([LanguageService], (service: LanguageService) => {
    expect(service).toBeTruthy();
  }));
});
