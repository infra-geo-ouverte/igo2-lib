import { Component } from '@angular/core';

import { Media, MediaOrientation, MediaService } from '@igo2/core/media';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent]
})
export class AppMediaComponent {
  constructor(private mediaService: MediaService) {}

  get media(): Media {
    return this.mediaService.getMedia();
  }

  get orientation(): MediaOrientation {
    return this.mediaService.getOrientation();
  }

  get isTouchScreen(): boolean {
    return this.mediaService.isTouchScreen();
  }
}
