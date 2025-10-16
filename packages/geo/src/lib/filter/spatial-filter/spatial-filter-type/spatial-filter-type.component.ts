import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input,
  model,
  output
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EntityStore } from '@igo2/common/entity';
import { IgoLanguageModule } from '@igo2/core/language';

import { Feature } from '../../../feature';
import { AnyLayer } from '../../../layer';
import { MeasureLengthUnit } from '../../../measure';
import {
  SpatialFilterQueryType,
  SpatialFilterType
} from '../../shared/spatial-filter.enum';
import { SpatialFilterListComponent } from '../spatial-filter-list/spatial-filter-list.component';

/**
 * Spatial Filter Type
 */
@Component({
  selector: 'igo-spatial-filter-type',
  templateUrl: './spatial-filter-type.component.html',
  styleUrls: ['./spatial-filter-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    SpatialFilterListComponent,
    MatButtonToggleModule,
    MatTooltipModule,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class SpatialFilterTypeComponent implements OnInit {
  public queryType: string[] = [
    'Arrond',
    'CircFed',
    'CircProv',
    'DirReg',
    'Mun',
    'MRC',
    'AdmRegion',
    'RegTour'
  ];
  public selectedTypeIndex = new UntypedFormControl(0);

  /**
   * Reference to the SpatialFIlterType enum
   * @internal
   */
  public spatialType = SpatialFilterType;

  public activeDrawType: SpatialFilterType = this.spatialType.Polygon;

  readonly store = input<EntityStore<Feature>>(undefined);
  selectedQueryType = model<SpatialFilterQueryType>(undefined);

  readonly zone = input<Feature>(undefined);

  readonly layers = input<AnyLayer[]>([]);

  public type: SpatialFilterType;

  readonly eventType = output<SpatialFilterType>();

  readonly eventQueryType = output<SpatialFilterQueryType>();

  readonly zoneChange = output<Feature>();
  readonly zoneWithBufferChange = output<Feature>();

  readonly bufferChange = output<number>();
  readonly measureUnitChange = output<MeasureLengthUnit>();

  ngOnInit() {
    if (this.selectedTypeIndex.value === 0) {
      this.type = this.spatialType.Predefined;
    }
    if (this.selectedTypeIndex.value === 1) {
      this.type = this.activeDrawType;
    }
    this.eventType.emit(this.type);
  }

  onTypeChange() {
    if (this.selectedTypeIndex.value === 0) {
      this.type = SpatialFilterType.Predefined;
    }
    if (this.selectedTypeIndex.value === 1) {
      this.type = this.activeDrawType;
    }
    this.eventType.emit(this.type);
  }

  onDrawTypeChange(spatialType: SpatialFilterType) {
    this.activeDrawType = spatialType;
    this.eventType.emit(this.activeDrawType);
  }

  onSelectionChange() {
    this.eventQueryType.emit(this.selectedQueryType());
    this.zoneChange.emit(undefined);
  }
}
