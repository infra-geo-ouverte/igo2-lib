import { Component, OnDestroy, OnInit } from '@angular/core';
import { IgoAuthModule } from '@igo2/auth';

import { MatButtonModule } from '@angular/material/button';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';
import { AuthService } from '@igo2/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, IgoAuthModule, MatButtonModule]
})
export class AppAuthFormComponent implements OnInit, OnDestroy {
  public logged: boolean = false;
  public logged$$: Subscription;
  constructor(private _authService: AuthService) {}

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
