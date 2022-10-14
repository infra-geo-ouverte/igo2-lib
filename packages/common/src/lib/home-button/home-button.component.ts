import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'igo-home-button',
  templateUrl: './home-button.component.html',
  styleUrls: ['./home-button.component.scss']
})
export class HomeButtonComponent {

  @Output() unselectButton = new EventEmitter<any>();

  constructor() {}

  onUnselectButtonClick() {
    this.unselectButton.emit();
  }
}
