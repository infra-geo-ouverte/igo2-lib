import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class AppRequestComponent {
  constructor(private http: HttpClient) {}

  callHttp() {
    const url = '/locale/en.json';
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
