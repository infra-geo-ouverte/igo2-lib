import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '@igo2/auth';
import { AuthFormComponent } from '@igo2/auth/form';

import { Subscription } from 'rxjs';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    AuthFormComponent,
    MatButtonModule
  ]
})
export class AppAuthFormComponent implements OnInit, OnDestroy {
  private _authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  public logged = false;
  public logged$$!: Subscription;

  ngOnInit() {
    this.logged$$ = this._authService.logged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((logged: boolean) => {
        this.logged = logged;
      });
  }

  logout() {
    this._authService.logout();
  }

  ngOnDestroy() {
    this.logged$$.unsubscribe();
  }
}
