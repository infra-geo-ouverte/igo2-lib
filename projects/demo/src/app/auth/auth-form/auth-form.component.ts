import { Component } from '@angular/core';

import { IgoAuthModule } from '@igo2/auth';
import { LanguageService } from '@igo2/core';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, IgoAuthModule]
})
export class AppAuthFormComponent {
  private idsActivity: string[] = [];

  constructor(private languageService: LanguageService) {}
}
