import { Component } from '@angular/core';

import { IgoAuthFormModule } from '@igo2/auth/form';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, IgoAuthFormModule]
})
export class AppAuthFormComponent {
  constructor() {}
}
