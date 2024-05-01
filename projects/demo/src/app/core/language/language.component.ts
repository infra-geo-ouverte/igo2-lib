import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { IgoLanguageModule, LanguageService } from '@igo2/core/language';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatButtonModule,
    IgoLanguageModule
  ]
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
