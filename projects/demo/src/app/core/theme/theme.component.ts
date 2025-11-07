import { Component, Renderer2, inject } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { LanguageService } from '@igo2/core/language';
import { loadTheme } from '@igo2/utils';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ]
})
export class AppThemeComponent {
  languageService = inject(LanguageService);
  private renderer = inject(Renderer2);

  lastTheme: string = 'blue-theme';
  themes = [
    { value: 'blue-theme', title: 'Blue' },
    { value: 'bluedark-theme', title: 'Blue-dark' },
    { value: 'bluedq-theme', title: 'Données Québec' },
    { value: 'teal-theme', title: 'Teal' }
  ];

  loadTheme(matSelectChange: MatSelectChange): void {
    const theme = matSelectChange.value;

    this.renderer.removeClass(document.body, this.lastTheme);
    this.renderer.addClass(document.body, theme);

    loadTheme(window.document, theme);
    this.lastTheme = theme;
  }
}
