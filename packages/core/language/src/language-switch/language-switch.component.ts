import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

// import { ConfigService } from '@igo2/core/config';

import { LanguageService } from '../shared/language.service';

@Component({
  selector: 'igo-language-switcher',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './language-switch.component.html',
  styleUrls: ['./language-switch.component.scss']
})
export class LanguageSwitchComponent {
  readonly enabled = input(false);
  readonly position = input<'header' | 'sidebar'>('sidebar');

  languageService = inject(LanguageService);
  // configService = inject(ConfigService);

  public toggleLanguage() {
    const newLang = this.languageService.getLanguage() === 'en' ? 'fr' : 'en';
    this.languageService.setLanguage(newLang);
  }

  public getSwitchLabel(): string {
    return this.languageService.getLanguage() === 'en' ? 'Français' : 'English';
  }
}
