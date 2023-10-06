import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityTableDefaultCellComponent } from './entity-table-default-cell/entity-table-default-cell.component';
import { IgoLanguageModule } from '@igo2/core';
import { IgoImageModule } from '../../image/image.module';
import { MatTableModule } from '@angular/material/table';
import { EntityTableChoiceCellComponent } from './entity-table-choice-cell/entity-table-choice-cell.component';

@NgModule({
  declarations: [
    EntityTableDefaultCellComponent,
    EntityTableChoiceCellComponent
  ],
  exports: [EntityTableDefaultCellComponent, EntityTableChoiceCellComponent],
  imports: [CommonModule, IgoLanguageModule, IgoImageModule, MatTableModule]
})
export class IgoEntityTableCellsModule {}
