import { NgModule, ModuleWithProviders } from '@angular/core';
import { XcolorPickerComponent } from './x-color-picker.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';

@NgModule({
    imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
    ],
    declarations: [XcolorPickerComponent],
    exports: [XcolorPickerComponent]
  })
  export class XcolorPickerModule {
    static forRoot(): ModuleWithProviders<XcolorPickerModule> {
      return {
        ngModule: XcolorPickerModule,
        providers: []
      };
    }
  }
