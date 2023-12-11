import { Component } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { LanguageService } from '@igo2/core';
import { loadTheme } from '@igo2/utils';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class AppThemeComponent {
  themes = [
    { value: 'blue', title: 'Blue' },
    { value: 'bluedark', title: 'Blue-dark' },
    { value: 'bluedq', title: 'Données Québec' },
    { value: 'bluegrey', title: 'Blue grey' },
    { value: 'dark', title: 'Dark' },
    { value: 'deeppurple', title: 'Purple' },
    { value: 'indigo', title: 'Indigo' },
    { value: 'orange', title: 'Orange' },
    { value: 'qcca', title: 'Québec.ca' },
    { value: 'teal', title: 'Teal' }
  ];

  constructor(public languageService: LanguageService) {}

  loadTheme(matSelectChange: MatSelectChange) {
    loadTheme(window.document, matSelectChange.value + '-theme');
  }
}
