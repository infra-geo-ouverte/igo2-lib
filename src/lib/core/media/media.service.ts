import { Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Media } from './media.type';


@Injectable()
export class MediaService {

  public media$ = new BehaviorSubject<Media>(undefined);

  private media: Media;

  constructor() {
    this.setMedia();

    window.addEventListener('resize', (event) => {
     this.setMedia();
    });
  }

  getMedia(): Media {
    const width = window.innerWidth;
    const height = window.innerHeight;

    let media = 'desktop';
    if (width <= 450 || height <= 450) {
      media = 'mobile';
    } else if (width <= 800) {
      media = 'tablet';
    }

    return media as Media;
  }

  private setMedia() {
    const media = this.getMedia();
    if (media !== this.media) {
      this.media = media;
      this.media$.next(media);
    }
  }

}
