import { Component, Renderer2 } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { LanguageService } from '@igo2/core';
import { loadTheme } from '@igo2/utils';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class AppThemeComponent {
  isDark: boolean;
  themes = [
    { value: 'blue', title: 'Blue' },
    { value: 'bluedark', title: 'Blue-dark' },
    { value: 'bluedq', title: 'Données Québec' },
    { value: 'bluegrey', title: 'Blue grey' },
    { value: 'dark', title: 'Dark' },
    { value: 'deeppurple', title: 'Purple' },
    { value: 'indigo', title: 'Indigo' },
    { value: 'orange', title: 'Orange' },
    { value: 'teal', title: 'Teal' }
  ];

  constructor(
    public languageService: LanguageService,
    private renderer: Renderer2
  ) {}

  loadTheme(matSelectChange: MatSelectChange): void {
    if (matSelectChange.value === 'dark-demo-test') {
      this.isDark = true;
      this.renderer.addClass(document.body, 'dark-theme');
      return;
    }

    if (this.isDark) {
      this.renderer.removeClass(document.body, 'dark-theme');
    }

    loadTheme(window.document, matSelectChange.value + '-theme');
  }
}
