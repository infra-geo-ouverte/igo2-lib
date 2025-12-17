import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ConfigService } from '@igo2/core/config';
import { IgoMap } from '@igo2/geo';

import { LanguageService } from '../language.service';

@Component({
  selector: 'igo-language-switcher',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './language-switch.component.html',
  styleUrls: ['./language-switch.component.scss']
})
export class LanguageSwitchComponent {
  enabled = input(false);
  position = input<'header' | 'map'>('map');

  languageService = inject(LanguageService);
  configService = inject(ConfigService);

  readonly map = input<IgoMap>(undefined);
}
