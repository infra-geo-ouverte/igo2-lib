import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'igo-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  host: {
    '[class.igo-panel-with-header]': 'withHeader()'
  }
})
export class PanelComponent {
  readonly title = input<string>(undefined);
  readonly withHeader = input(true);
  readonly cursorPointer = input(false);
}
