import { Component, input } from '@angular/core';

@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  styleUrls: ['./doc-viewer.component.scss'],
  imports: []
})
export class DocViewerComponent {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly dependencies = input<string[]>();
}
