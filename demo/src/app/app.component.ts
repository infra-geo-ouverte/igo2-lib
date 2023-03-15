import { MediaMatcher } from '@angular/cdk/layout';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  Renderer2
} from '@angular/core';

import { userAgent } from '@igo2/utils';
import { version } from '@igo2/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  mobileQuery: MediaQueryList;

  public title = 'IGO';
  public version = version;
  private themeClass = 'deeppurple-theme';
  private _mobileQueryListener: () => void;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private renderer: Renderer2
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.renderer.addClass(document.body, this.themeClass);

    this.detectOldBrowser();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  private detectOldBrowser() {
    const oldBrowser = userAgent.satisfies({
      ie: '<=11',
      chrome: '<64',
      firefox: '<60'
    });

    if (oldBrowser) {
      console.log('Very old browser ! ', userAgent.getBrowser());
    }
  }
}
