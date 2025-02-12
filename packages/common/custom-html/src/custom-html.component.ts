import { Component, Input } from '@angular/core';

import { SanitizeHtmlPipe } from './custom-html.pipe';

@Component({
    selector: 'igo-custom-html',
    templateUrl: './custom-html.component.html',
    styleUrls: ['./custom-html.component.scss'],
    imports: [SanitizeHtmlPipe]
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
}
