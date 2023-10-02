import { MediaMatcher } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { version } from '@igo2/core';
import { DomUtils, userAgent } from '@igo2/utils';

import { delay, first } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;

  public title = 'IGO';
  public version = version;
  private _mobileQueryListener: () => void;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private router: Router
  ) {
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.detectOldBrowser();
  }

  ngOnInit(): void {
    this.handleSplashScreen();
  }

  private handleSplashScreen(): void {
    this.router.events
      .pipe(
        first((events) => events instanceof NavigationEnd),
        delay(300)
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
