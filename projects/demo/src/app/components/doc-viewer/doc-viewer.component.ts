import { Component, input } from '@angular/core';

@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  styleUrls: ['./doc-viewer.component.scss'],
  imports: []
})
export class DocViewerComponent {
  readonly title = input<string>(undefined);
  readonly subtitle = input<string>(undefined);
  readonly dependencies = input<string[]>(undefined);
}
