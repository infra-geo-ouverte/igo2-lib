import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  styleUrls: ['./doc-viewer.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor]
})
export class DocViewerComponent {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() dependencies: string[];
}
