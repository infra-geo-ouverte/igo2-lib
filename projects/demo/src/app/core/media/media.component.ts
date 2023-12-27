import { Component } from '@angular/core';

import { Media, MediaOrientation, MediaService } from '@igo2/core';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
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
