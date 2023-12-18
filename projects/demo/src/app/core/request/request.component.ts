import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { LanguageService } from '@igo2/core';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, MatButtonModule]
})
export class AppRequestComponent {
  constructor(
    private http: HttpClient,
    public languageService: LanguageService
  ) {}

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
