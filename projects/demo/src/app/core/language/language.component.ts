import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule, LanguageService } from '@igo2/core/language';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class AppLanguageComponent {
  private languageService = inject(LanguageService);

  public app = {
    title: 'IGO'
  };

  changeLanguage(language: string) {
    this.languageService.setLanguage(language);
    console.log(this.languageService);
  }
}
