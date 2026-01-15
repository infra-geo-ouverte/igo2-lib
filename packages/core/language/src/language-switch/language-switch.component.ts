import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { LanguageService } from '../shared/language.service';

@Component({
  selector: 'igo-language-switcher',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './language-switch.component.html',
  styleUrls: ['./language-switch.component.scss']
})
export class LanguageSwitchComponent {
  languageService = inject(LanguageService);

  public toggleLanguage() {
    const newLang = this.languageService.getLanguage() === 'en' ? 'fr' : 'en';
    this.languageService.setLanguage(newLang);
  }

  public getSwitchLabel(): string {
    return this.languageService.getLanguage() === 'en'
      ? 'language.french'
      : 'language.english';
  }
}
