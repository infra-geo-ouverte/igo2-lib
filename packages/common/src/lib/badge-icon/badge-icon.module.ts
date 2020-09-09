import { NgModule, ModuleWithProviders } from '@angular/core';
import { IgoBadgeIconDirective } from './badge-icon.directive';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [MatBadgeModule, MatIconModule],
  declarations: [IgoBadgeIconDirective],
  exports: [MatBadgeModule, IgoBadgeIconDirective]
})
export class IgoMatBadgeIconModule {
  static forRoot(): ModuleWithProviders<IgoMatBadgeIconModule> {
    return {
      ngModule: IgoMatBadgeIconModule,
      providers: []
    };
  }
}
