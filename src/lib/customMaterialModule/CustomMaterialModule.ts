import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { A11yModule } from '@angular/material';
import { CompatibilityModule } from '@angular/material';
import { MdAutocompleteModule } from '@angular/material';
import { MdButtonToggleModule } from '@angular/material';
import { MdButtonModule } from '@angular/material';
import { MdCheckboxModule } from '@angular/material';
import { MdDialogModule } from '@angular/material';
import { MdListModule } from '@angular/material';
import { MdGridListModule } from '@angular/material';
import { MdCardModule } from '@angular/material';
import { MdChipsModule } from '@angular/material';
import { MdIconModule } from '@angular/material';
import { MdInputModule } from '@angular/material';
import { MdMenuModule } from '@angular/material';
import { MdProgressSpinnerModule } from '@angular/material';
import { MdProgressBarModule } from '@angular/material';
import { MdRadioModule } from '@angular/material';
import { MdRippleModule } from '@angular/material';
import { MdSelectModule } from '@angular/material';
import { MdSlideToggleModule } from '@angular/material';
import { MdSliderModule } from '@angular/material';
import { MdSidenavModule } from '@angular/material';
import { MdSnackBarModule } from '@angular/material';
import { MdTabsModule } from '@angular/material';
import { MdToolbarModule } from '@angular/material';
import { MdTooltipModule } from '@angular/material';
import { StyleModule } from '@angular/material';
import { MdTableModule } from '@angular/material';

const MATERIAL_MODULES = [
  CommonModule,
  MdAutocompleteModule,
  MdButtonModule,
  MdCardModule,
  MdChipsModule,
  MdCheckboxModule,
  MdGridListModule,
  MdInputModule,
  MdListModule,
  MdProgressBarModule,
  MdProgressSpinnerModule,
  MdRippleModule,
  MdSelectModule,
  MdSidenavModule,
  MdTabsModule,
  MdToolbarModule,
  MdTableModule,
  // These modules include providers.
  A11yModule,
  CompatibilityModule,
  MdButtonToggleModule,
  MdDialogModule,
  MdIconModule,
  MdMenuModule,
  MdRadioModule,
  MdSliderModule,
  MdSlideToggleModule,
  MdSnackBarModule,
  MdTooltipModule,
  StyleModule
];


@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES
})
export class CustomMaterialModule { }
