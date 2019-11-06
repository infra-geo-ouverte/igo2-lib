import { NgModule, ModuleWithProviders } from '@angular/core';
import { MatBadgeIconDirective } from './badge-icon.directive';
import { MatBadgeModule, MatIconModule } from '@angular/material';

@NgModule({
  imports: [MatBadgeModule, MatIconModule],
  declarations: [MatBadgeIconDirective],
  exports: [MatBadgeIconDirective]
})
export class IgoMatBadgeIconModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoMatBadgeIconModule,
      providers: []
    };
  }
}
