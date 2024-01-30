import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthFormComponent } from './auth-form/auth-form.component';

const routes: Routes = [
  { path: 'login', component: AuthFormComponent },
  { path: 'logout', component: AuthFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class AuthRoutingModule {}
