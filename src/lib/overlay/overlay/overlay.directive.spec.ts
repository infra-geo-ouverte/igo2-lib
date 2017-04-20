import { TestBed } from '@angular/core/testing';

// import { MapBrowserComponent } from '../../map';

// import { OverlayDirective } from './overlay.directive';
import { OverlayService } from '../shared';

describe('OverlayDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        OverlayService
      ]
    });
  });

  it('should create an instance', () => {
    expect(true).toBeTruthy();
  });
});
