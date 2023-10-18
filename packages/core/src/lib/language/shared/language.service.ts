import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private language: string;
  readonly language$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  constructor(public translate: TranslateService) {
    this.language = this.translate.getBrowserLang();
    const lang = this.getLanguage();
    this.translate.setDefaultLang(lang);
    this.language$.next(lang);
  }

  public getLanguage(): string {
    return this.language.match(/en|fr/) ? this.language : 'en';
  }

  public setLanguage(language: string) {
    this.language = language.match(/en|fr/) ? language : 'en';
    combineLatest([
      this.translate.use(this.language),
      this.translate.reloadLang(this.language)
    ]).subscribe(() => {
      this.language$.next(this.language);
    });
  }
}
