import { Component } from '@angular/core';

import { MediaService } from '@igo2/core';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class AppMediaComponent {
  constructor(private mediaService: MediaService) {}

  get media() {
    return this.mediaService.getMedia();
  }

  get orientation() {
    return this.mediaService.getOrientation();
  }

  get isTouchScreen() {
    return this.mediaService.isTouchScreen();
  }
}
