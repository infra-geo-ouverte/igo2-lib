import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { LanguageService } from '@igo2/core/language';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
  imports: [
    // IgoErrorModule,
    // IgoLoggingModule, // Import in your root module or main.ts, only if you want register http calls in console
    DocViewerComponent,
    ExampleViewerComponent,
    MatButtonModule
  ]
})
export class AppRequestComponent {
  private http = inject(HttpClient);
  languageService = inject(LanguageService);

  callHttp() {
    const url = 'https://geoegl.msp.gouv.qc.ca/apis/icherche/info';
    this.http.get(url).subscribe((rep) => {
      console.log(rep);
    });
  }

  callHttpError() {
    const url = '404';
    this.http.get(url).subscribe((rep) => {
      console.log(rep);
    });
  }
}
