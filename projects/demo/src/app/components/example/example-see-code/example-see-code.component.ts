import { Component, input } from '@angular/core';

@Component({
  selector: 'app-example-see-code',
  templateUrl: './example-see-code.component.html',
  styleUrls: ['./example-see-code.component.scss']
})
export class ExampleSeeCodeComponent {
  readonly href = input<string>();
}
