import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';

import { userAgent, DomUtils } from '@igo2/utils';
import { version } from '@igo2/core';
import { NavigationEnd, Router } from '@angular/router';
import { first, timeout } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  mobileQuery: MediaQueryList;

  public title = 'IGO';
  public version = version;
  private _mobileQueryListener: () => void;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private router: Router,
  ) {
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.detectOldBrowser();

    this.handleSplashScreen();
  }

  private handleSplashScreen(): void {
    this.router.events
      .pipe(
        first((events) => events instanceof NavigationEnd),
        timeout(1000)
      )
      .subscribe(() => {
        this._removeSplashScreen();
      });
  }

  private _removeSplashScreen(): void {
    const intro = this.document.getElementById('splash-screen');
    if (!intro) {
      return;
    }
    intro.classList.add('is-destroying');

    const destroyingAnimationTime = 300;
    const stylesheet = this.document.getElementById('splash-screen-stylesheet');

    setTimeout(() => {
      DomUtils.remove(intro);
      DomUtils.remove(stylesheet);
    }, destroyingAnimationTime);
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
