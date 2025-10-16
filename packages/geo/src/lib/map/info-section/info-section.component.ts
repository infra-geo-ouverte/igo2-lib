import { Component, input } from '@angular/core';

@Component({
  selector: 'igo-info-section',
  templateUrl: './info-section.component.html',
  styleUrls: ['./info-section.component.scss'],
  imports: []
})
export class InfoSectionComponent {
  readonly infoContent = input('');
}
