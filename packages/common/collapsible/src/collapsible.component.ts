import { Component, input, model, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { CollapseDirective } from './collapse.directive';

@Component({
  selector: 'igo-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss'],
  imports: [MatListModule, MatIconModule, CollapseDirective]
})
export class CollapsibleComponent {
  readonly title = input('');
  readonly collapsed = model(false);

  readonly toggle = output<boolean>();
}
