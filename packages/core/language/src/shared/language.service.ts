import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  translate = inject(TranslateService);
  configService = inject(ConfigService);

  private language: string;
  readonly language$ = new BehaviorSubject<string>(undefined);

  constructor() {
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
  public toggleLanguage() {
    const newLang = this.language === 'en' ? 'fr' : 'en';
    this.setLanguage(newLang);
  }

  public getSwitchLabel(): string {
    return this.language === 'en' ? 'Français' : 'English';
  }

  getSwitcherConfig(): { enabled: boolean; position: 'header' | 'map' } {
    const cfg = this.configService.getConfig<{
      enabled: boolean;
      position?: 'header' | 'map';
    }>('languageSwitcher');
    const hasHeader = this.configService.getConfig<boolean>(
      'header.hasHeader',
      true
    );

    const enabled = cfg?.enabled ?? false;
    const position = cfg?.position ?? (hasHeader ? 'header' : 'map');

    return { enabled, position };
  }
}
