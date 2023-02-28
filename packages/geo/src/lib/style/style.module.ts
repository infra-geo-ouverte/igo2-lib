import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IgoLanguageModule } from '@igo2/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { IgoStyleListModule } from './style-list/style-list.module';
import { StyleModalComponent } from './style-modal/style-modal.component';
import { DrawStyleService } from './style-service/draw-style.service';
import { StyleService } from './style-service/style.service';

@NgModule({
  imports: [
    ColorPickerModule,
    CommonModule,
    FormsModule,
    IgoLanguageModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
    IgoStyleListModule.forRoot()
  ],
  exports: [IgoStyleListModule, StyleModalComponent],
  declarations: [StyleModalComponent]
})
export class IgoStyleModule {
  static forRoot(): ModuleWithProviders<IgoStyleModule> {
    return {
      ngModule: IgoStyleModule,
      providers: [StyleService, DrawStyleService]
    };
  }
}
