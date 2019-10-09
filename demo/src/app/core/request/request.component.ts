import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { LanguageService } from '@igo2/core';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class AppRequestComponent {
  constructor(
    private http: HttpClient,
    public languageService: LanguageService
  ) {}

  callHttp() {
    const url = 'https://geoegl.msp.gouv.qc.ca/apis/icherche/info';
    this.http.get(url).subscribe(rep => {
      console.log(rep);
    });
  }

  callHttpError() {
    const url = '404';
    this.http.get(url).subscribe(rep => {
      console.log(rep);
    });
  }
}
