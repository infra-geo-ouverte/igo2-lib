import { TestBed, inject } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';

import { LanguageService } from './language.service';

describe('LanguageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()]
    });
  });

  it('should create', inject([LanguageService], (service: LanguageService) => {
    expect(service).toBeTruthy();
  }));
});
