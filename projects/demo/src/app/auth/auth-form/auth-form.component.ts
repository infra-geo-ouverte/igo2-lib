import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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

  public logged = false;
  public logged$$: Subscription;

  ngOnInit() {
    this.logged$$ = this._authService.logged$.subscribe((logged: boolean) => {
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
