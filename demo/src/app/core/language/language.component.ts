import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class AppLanguageComponent {
  public app = {
    title: 'IGO'
  };
  constructor(private languageService: LanguageService) {}

  changeLanguage(language: string) {
    this.languageService.setLanguage(language);
    console.log(this.languageService);
  }
}
