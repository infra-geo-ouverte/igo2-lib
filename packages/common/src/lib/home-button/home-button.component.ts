import { Component, EventEmitter, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'igo-home-button',
    templateUrl: './home-button.component.html',
    styleUrls: ['./home-button.component.scss'],
    standalone: true,
    imports: [MatButtonModule, MatTooltipModule, MatIconModule, TranslateModule]
})
export class HomeButtonComponent {
  @Output() unselectButton = new EventEmitter<any>();

  constructor() {}

  onUnselectButtonClick() {
    this.unselectButton.emit();
  }
}
