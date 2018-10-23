import { Component, Input } from '@angular/core';

@Component({
  selector: 'igo-custom-html',
  templateUrl: './custom-html.component.html',
  styleUrls: ['./custom-html.component.scss']
})
export class CustomHtmlComponent {
  @Input()
  get html(): string {
    return this._html;
  }
  set html(value: string) {
    this._html = value;
  }
  private _html = '';

  constructor() {}
}
