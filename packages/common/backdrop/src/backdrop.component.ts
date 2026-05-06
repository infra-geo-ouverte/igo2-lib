import { Component, input } from '@angular/core';

@Component({
  selector: 'igo-backdrop',
  templateUrl: './backdrop.component.html',
  styleUrls: ['./backdrop.component.scss']
})
export class BackdropComponent {
  shown = input(false);
}
