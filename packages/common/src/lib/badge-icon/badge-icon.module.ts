import { NgModule } from '@angular/core';
import { MatBadgeIconDirective } from './badge-icon.directive';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [MatBadgeModule, MatIconModule],
  declarations: [MatBadgeIconDirective],
  exports: [MatBadgeIconDirective]
})
export class IgoMatBadgeIconModule {
  static forRoot() {
    return {
      ngModule: IgoMatBadgeIconModule,
      providers: []
    };
  }
}
