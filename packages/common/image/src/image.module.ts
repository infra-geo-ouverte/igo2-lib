import { ModuleWithProviders, NgModule } from '@angular/core';

import { ImageErrorDirective } from './image-error.directive';
import { SecureImagePipe } from './secure-image.pipe';

/**
 * @deprecated import the components/directives directly or IMAGE_DIRECTIVES for the set
 */
@NgModule({
  imports: [SecureImagePipe, ImageErrorDirective],
  exports: [SecureImagePipe, ImageErrorDirective]
})
export class IgoImageModule {
  static forRoot(): ModuleWithProviders<IgoImageModule> {
    return {
      ngModule: IgoImageModule,
      providers: []
    };
  }
}
