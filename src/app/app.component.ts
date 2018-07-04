import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';

@Component({
  selector: 'igo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'igo';

  constructor(public languageService: LanguageService) {}
}
