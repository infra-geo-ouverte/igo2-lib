import { NgFor } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { LanguageService } from '@igo2/core';
import { loadTheme } from '@igo2/utils';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule
  ]
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
