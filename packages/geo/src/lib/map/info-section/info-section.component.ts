import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'igo-info-section',
  templateUrl: './info-section.component.html',
  styleUrls: ['./info-section.component.scss'],
  standalone: true,
  imports: [NgIf]
})
export class InfoSectionComponent {
  @Input() infoContent = '';

  constructor() {}
}
