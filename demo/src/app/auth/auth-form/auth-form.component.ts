import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss']
})
export class AppAuthFormComponent {
  private idsActivity: string[] = [];

  constructor(private languageService: LanguageService) {}
}
