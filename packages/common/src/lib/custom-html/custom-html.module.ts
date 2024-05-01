import { ModuleWithProviders, NgModule } from '@angular/core';

import { CustomHtmlComponent } from './custom-html.component';
import { SanitizeHtmlPipe } from './custom-html.pipe';

/**
 * @deprecated import the components/directives directly or CUSTOM_HTML_DIRECTIVES for the set
 */
@NgModule({
  imports: [SanitizeHtmlPipe, CustomHtmlComponent],
  exports: [SanitizeHtmlPipe, CustomHtmlComponent]
})
export class IgoCustomHtmlModule {
  static forRoot(): ModuleWithProviders<IgoCustomHtmlModule> {
    return {
      ngModule: IgoCustomHtmlModule
    };
  }
}
