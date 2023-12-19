import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { CustomHtmlComponent } from './custom-html.component';
import { SanitizeHtmlPipe } from './custom-html.pipe';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatTooltipModule,
        MatInputModule,
        MatButtonModule,
        IgoLanguageModule,
        SanitizeHtmlPipe, CustomHtmlComponent
    ],
    exports: [SanitizeHtmlPipe, CustomHtmlComponent]
})
export class IgoCustomHtmlModule {
  static forRoot(): ModuleWithProviders<IgoCustomHtmlModule> {
    return {
      ngModule: IgoCustomHtmlModule
    };
  }
}
