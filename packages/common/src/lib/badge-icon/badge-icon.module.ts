import { NgModule, ModuleWithProviders } from '@angular/core';
import { MatBadgeIconDirective } from './badge-icon.directive';
import { MatBadgeModule, MatButtonModule, MatIconModule } from '@angular/material';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@NgModule({
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatIconModule
  ],
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

  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl(
        './assets/igo2/core/icons/mdi.svg'
      )
    );
  }
}
