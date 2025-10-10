import { MediaMatcher } from '@angular/cdk/layout';
import {
  ChangeDetectorRef,
  Component,
  DOCUMENT,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { version } from '@igo2/core/config';
import { DomUtils } from '@igo2/utils';

import { delay, first } from 'rxjs';

import { ROUTES_CONFIG } from './app.routing';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    MatExpansionModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private document = inject<Document>(DOCUMENT);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private media = inject(MediaMatcher);
  private router = inject(Router);

  mobileQuery: MediaQueryList;

  routesConfig = ROUTES_CONFIG;

  public title = 'IGO';
  public version = version;
  private _mobileQueryListener: () => void;

  constructor() {
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
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
}
