import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl
} from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { EntityStore } from '@igo2/common/entity';
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';

import { Observable, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  take
} from 'rxjs/operators';

import { Feature } from '../../../feature';
import { MeasureLengthUnit } from '../../../measure/shared';
import {
  SpatialFilterQueryType,
  SpatialFilterType
} from './../../shared/spatial-filter.enum';
import { SpatialFilterService } from './../../shared/spatial-filter.service';

@Component({
  selector: 'igo-spatial-filter-list',
  templateUrl: './spatial-filter-list.component.html',
  styleUrls: ['./spatial-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    FormsModule,
    IgoLanguageModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    ReactiveFormsModule
  ]
})
export class SpatialFilterListComponent implements OnInit, OnDestroy {
  private spatialFilterService = inject(SpatialFilterService);
  private messageService = inject(MessageService);
  private cdRef = inject(ChangeDetectorRef);

  readonly store = input.required<EntityStore<Feature>>();

  @Input({ required: true })
  get queryType(): SpatialFilterQueryType {
    return this._queryType;
  }
  set queryType(queryType: SpatialFilterQueryType) {
    if (this._queryType !== queryType) {
      this.selectedZones = [];
      this.zonesWithBuffer = [];
    }
    this.formControl.setValue('');
    this._queryType = queryType;
  }
  private _queryType: SpatialFilterQueryType;

  readonly bufferChange = output<number>();
  readonly measureUnitChange = output<MeasureLengthUnit>();
  readonly addZone = output<Feature>();
  readonly removeZone = output<Feature>();
  readonly zonesWithBufferChange = output<Feature[]>();

  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;
  public formControl = new UntypedFormControl();
  public bufferFormControl = new UntypedFormControl();
  public selectedZones: Feature[] = [];

  private zonesWithBuffer: Feature[] = [];
  private formValueChanges$$: Subscription;
  private bufferValueChanges$$: Subscription;
  inFlightIds = new Set<string | number>();

  autocomplete = viewChild.required(MatAutocomplete);
  autocompleteTrigger = viewChild.required(MatAutocompleteTrigger);

  /**
   * Available measure units for the measure type given
   * @internal
   */
  get measureUnits(): string[] {
    return [MeasureLengthUnit.Meters, MeasureLengthUnit.Kilometers];
  }

  filteredEntities$: Observable<Feature[]>;

  ngOnInit() {
    this.formValueChanges$$ = this.formControl.valueChanges.subscribe(
      (value) => {
        if (value.length) {
          const filterNormalized = this.normalizeString(value);

          this.store().view.filter((feature) =>
            this.normalizeString(feature.properties.nom).includes(
              filterNormalized
            )
          );
        } else {
          this.store().view.clear();
        }
      }
    );

    this.bufferValueChanges$$ = this.bufferFormControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.updateBuffer(value);
      });

    this.filteredEntities$ = this.store()
      .view.all$()
      .pipe(
        map((entities) => {
          if (!this._queryType) return [];
          return entities;
        })
      );
  }

  ngOnDestroy() {
    this.formValueChanges$$.unsubscribe();
    this.bufferValueChanges$$.unsubscribe();
  }

  displayFn(feature?: Feature): string | undefined {
    return feature ? feature.properties.nom : undefined;
  }

  /**
   * Set the measure unit
   * @internal
   */
  onMeasureUnitChange(unit: MeasureLengthUnit) {
    if (unit === this.measureUnit) return;
    this.measureUnit = unit;
    this.measureUnitChange.emit(this.measureUnit);
    const value = this.bufferFormControl.value;
    if (value !== null) {
      const converted =
        unit === MeasureLengthUnit.Meters ? value * 1000 : value / 1000;
      this.bufferFormControl.setValue(converted);
    }
  }

  /**
   * multiple selection of zones
   */

  select(event: MatAutocompleteSelectedEvent): void {
    const zone = event.option.value;
    const buffer = this.bufferFormControl.value;
    if (buffer === null) {
      const id = zone?.meta?.id;
      if (!this.isSelected(zone) && !this.inFlightIds.has(id)) {
        this.inFlightIds.add(id);
        this.spatialFilterService
          .loadItemById(zone, this.queryType)
          .pipe(
            take(1),
            finalize(() => this.inFlightIds.delete(id))
          )
          .subscribe((featureGeom: Feature) => {
            this.addZone.emit(featureGeom);
            this.selectedZones.push(featureGeom);
            this.cdRef.detectChanges();
          });
      }
    } else {
      this.applyBuffer(buffer, zone);
    }
    this.resetInputAndPanel();
  }

  remove(feature: Feature): void {
    const index = this.selectedZones.findIndex(
      (item) => item.meta.id === feature.meta.id
    );

    if (index >= 0) {
      this.selectedZones.splice(index, 1);
      this.removeZone.emit(feature);
    }

    if (this.selectedZones.length === 0) {
      this.zonesWithBuffer = [];
    }
    this.resetInputAndPanel();
  }

  isSelected(entity: Feature): boolean {
    return this.selectedZones.some((z) => z.meta.id === entity.meta.id);
  }

  private applyBuffer(buffer: number, zone: Feature) {
    const value = this.normalizeBuffer(buffer);
    if (value === null) {
      this.resetBufferWithWarning();
      return;
    }

    this.spatialFilterService
      .loadBufferGeometry(
        zone,
        SpatialFilterType.Predefined,
        value,
        this.queryType
      )
      .subscribe((featureGeom: Feature) => {
        const zonesWithBuffer = this.zonesWithBuffer.findIndex(
          (item) => item.meta.id === featureGeom.meta.id
        );
        if (zonesWithBuffer <= 0) {
          this.zonesWithBuffer.push(featureGeom);
          this.selectedZones = this.zonesWithBuffer;
        }

        this.zonesWithBufferChange.emit(this.zonesWithBuffer);
      });
  }

  private updateBuffer(value: number) {
    const normalized = this.normalizeBuffer(value);
    if (normalized === null) {
      this.resetBufferWithWarning();
      return;
    }

    this.bufferChange.emit(value);
    this.spatialFilterService
      .loadBuffersGeometry(this.selectedZones, {
        filterType: SpatialFilterType.Predefined,
        buffer: normalized,
        type: this.queryType
      })
      .subscribe((featuresGeom: Feature[]) => {
        this.selectedZones = this.zonesWithBuffer = featuresGeom;
        this.zonesWithBufferChange.emit(this.zonesWithBuffer);
      });
  }

  private normalizeBuffer(value: number): number | null {
    if (this.measureUnit === MeasureLengthUnit.Meters) {
      return value >= 0 && value <= 100000 ? value : null;
    }
    if (this.measureUnit === MeasureLengthUnit.Kilometers) {
      return value >= 0 && value <= 100 ? value * 1000 : null;
    }
    return null;
  }

  private resetBufferWithWarning(): void {
    this.bufferFormControl.setValue(0);
    this.messageService.alert(
      'igo.geo.spatialFilter.bufferAlert',
      'igo.geo.spatialFilter.warning'
    );
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private resetInputAndPanel() {
    this.formControl.setValue('');
    this.clearAutocompleteSelection();
    this.repositionAutocomplete();
  }

  private clearAutocompleteSelection(): void {
    this.autocomplete().options.forEach((opt) => opt.deselect());
  }

  private repositionAutocomplete() {
    requestAnimationFrame(() => this.autocompleteTrigger().updatePosition());
  }
}
