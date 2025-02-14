import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { IgoIconComponent } from '@igo2/common/icon';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-icon',
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    IgoIconComponent,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss'
})
export class AppIconComponent {
  exampleIndexHtml: string = EXAMPLE_INDEX_HTML;
  exampleIndexStaticHtml: string = EXAMPLE_INDEX_STATIC_HTML;
  exampleStyleVariable: string = EXAMPLE_STYLE_VARIABLE;
  exampleProvider: string = EXAMPLE_PROVIDER;

  nameControl = new FormControl<string>('shopping_cart_checkout');
}

const EXAMPLE_INDEX_STATIC_HTML = `<link rel="stylesheet" href=""https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0"" />`;
const EXAMPLE_INDEX_HTML = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />`;

const EXAMPLE_STYLE_VARIABLE = `.material-symbols-outlined {
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 24
}`;

const EXAMPLE_PROVIDER = `import { provideIcon } from '@igo2/common/icon';

bootstrapApplication(AppComponent, {
  providers: [
    provideIcon(),
  ]
})
`;
