import { Component, Input } from '@angular/core';

@Component({
  selector: 'igo-info-section',
  templateUrl: './info-section.component.html',
  styleUrls: ['./info-section.component.scss']
})
export class InfoSectionComponent {
  @Input() infoContent: string = '';

  constructor() {}
}
