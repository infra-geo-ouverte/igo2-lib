import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private language: string;
  readonly language$ = new BehaviorSubject<string>(undefined);

  constructor(public translate: TranslateService) {
    const defaultLang = this.translate.defaultLang;
    if (defaultLang && this.matchLanguage(defaultLang)) {
      this.language = defaultLang;
      this.language$.next(defaultLang);
    } else {
      this.setBrowserLanguage();
    }
  }
  private setBrowserLanguage() {
    this.language = this.translate.getBrowserLang();
    const lang = this.getLanguage();
    this.translate.setDefaultLang(lang);
    this.language$.next(lang);
  }

  public getLanguage(): string {
    return this.matchLanguage(this.language) ? this.language : 'en';
  }

  private matchLanguage(lang: string): boolean {
    return !!lang.match(/en|fr/);
  }

  public setLanguage(language: string) {
    this.language = this.matchLanguage(language) ? language : 'en';
    combineLatest([
      this.translate.use(this.language),
      this.translate.reloadLang(this.language)
    ]).subscribe(() => {
      this.language$.next(this.language);
    });
  }
}
