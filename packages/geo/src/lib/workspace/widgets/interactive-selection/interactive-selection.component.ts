import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject
} from '@angular/core';
import { Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { OnUpdateInputs } from '@igo2/common/dynamic-component';
import {
  Form,
  FormComponent,
  FormFieldComponent,
  FormService
} from '@igo2/common/form';
import { WidgetComponent } from '@igo2/common/widget';
import { IgoLanguageModule, LanguageService } from '@igo2/core/language';

import * as olstyle from 'ol/style';

import { BehaviorSubject, Observable, Subscription, pairwise } from 'rxjs';

import { FeatureStore, featureToOl } from '../../../feature';
import { FEATURE } from '../../../feature/shared/feature.enums';
import {
  Feature,
  FeatureGeometry
} from '../../../feature/shared/feature.interfaces';
import {
  bufferOlGeometry,
  doesOlGeometryIntersects
} from '../../../geometry/shared/geometry.utils';
import { IgoMap } from '../../../map/shared/map';
import { FeatureWorkspace } from '../../shared/feature-workspace';
import { WfsWorkspace } from '../../shared/wfs-workspace';

interface DataSelectionData {
  geometry?: FeatureGeometry;
  action?: SelectionAction;
  buffer?: string;
}

enum SelectionAction {
  New = 'new',
  Add = 'add',
  Remove = 'remove'
}

@Component({
  selector: 'igo-interactive-selection',
  templateUrl: './interactive-selection.component.html',
  styleUrls: ['./interactive-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    FormComponent,
    FormFieldComponent
  ]
})
export class InteractiveSelectionFormComponent
  implements OnInit, OnDestroy, OnUpdateInputs, WidgetComponent
{
  private cdRef = inject(ChangeDetectorRef);
  private formService = inject(FormService);
  private languageService = inject(LanguageService);

  public form$ = new BehaviorSubject<Form>(undefined);
  public submitButtonText$ = new BehaviorSubject<string>(undefined);
  public submitDisabled = true;
  private valueChanges$$: Subscription;
  public data$ = new BehaviorSubject<DataSelectionData>({
    geometry: undefined,
    buffer: undefined,
    action: SelectionAction.Add
  });
  @Input() map: IgoMap;
  @Input() workspace: FeatureWorkspace | WfsWorkspace;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();
  ngOnInit(): void {
    const fieldConfigs = [
      {
        name: 'geometry',
        title: '',
        type: 'geometry',
        options: {
          validator: Validators.required
        },
        inputs: {
          map: this.map,
          geometryTypeField: true,
          geometryType: 'Polygon',
          drawGuideField: false,
          drawGuide: 0,
          drawGuidePlaceholder: '',
          drawStyle: new olstyle.Style({
            stroke: new olstyle.Stroke({
              color: [255, 0, 0, 1],
              width: 2
            }),
            fill: new olstyle.Fill({
              color: [255, 0, 0, 0.2]
            }),
            image: new olstyle.Circle({
              radius: 8,
              stroke: new olstyle.Stroke({
                color: [255, 0, 0, 1]
              }),
              fill: new olstyle.Fill({
                color: [255, 0, 0, 0.2]
              })
            })
          }),
          overlayStyle: new olstyle.Style({
            stroke: new olstyle.Stroke({
              color: [0, 255, 0, 1],
              width: 2
            }),
            fill: new olstyle.Fill({
              color: [0, 255, 0, 0.2]
            }),
            image: new olstyle.Circle({
              radius: 8,
              stroke: new olstyle.Stroke({
                color: [0, 255, 0, 1]
              }),
              fill: new olstyle.Fill({
                color: [0, 255, 0, 0.2]
              })
            })
          })
        }
      },
      {
        name: 'action',
        title: this.languageService.translate.instant(
          'igo.geo.workspace.widget.interactiveSelection.action.title'
        ),
        type: 'select',
        options: {
          cols: 1,
          validator: Validators.required
        },
        inputs: {
          choices: [
            {
              value: SelectionAction.New,
              title: this.languageService.translate.instant(
                'igo.geo.workspace.widget.interactiveSelection.selection.new'
              )
            },
            {
              value: SelectionAction.Add,
              title: this.languageService.translate.instant(
                'igo.geo.workspace.widget.interactiveSelection.selection.add'
              )
            },
            {
              value: SelectionAction.Remove,
              title: this.languageService.translate.instant(
                'igo.geo.workspace.widget.interactiveSelection.selection.remove'
              )
            }
          ]
        }
      },
      {
        name: 'buffer',
        title: this.languageService.translate.instant(
          'igo.geo.workspace.widget.interactiveSelection.buffer.title'
        ),
        type: 'text',
        options: {
          cols: 1,
          validator: Validators.pattern(/^\d+$/)
        }
      }
    ];
    this.setAction(SelectionAction.Add);

    const fields = fieldConfigs.map((config) => this.formService.field(config));
    const form = this.formService.form(fields, []);

    this.valueChanges$$ = (
      form.control.valueChanges satisfies Observable<DataSelectionData>
    )
      .pipe(pairwise())
      .subscribe(([previous, current]) => {
        const currentValues = current;
        if (previous?.action !== current.action) {
          currentValues.buffer = undefined;
        }
        this.data$.next(currentValues);
        this.submitDisabled = !form.control.valid;
        if (
          !currentValues ||
          !currentValues.action ||
          currentValues.action === SelectionAction.Add
        ) {
          this.setAction(SelectionAction.Add);
        } else if (currentValues.action === SelectionAction.New) {
          this.setAction(SelectionAction.New);
        } else if (currentValues.action === SelectionAction.Remove) {
          this.setAction(SelectionAction.Remove);
        }
      });

    this.form$.next(form);
  }

  private setAction(action: SelectionAction) {
    this.submitButtonText$.next(
      `igo.geo.workspace.widget.interactiveSelection.selection.${action}`
    );
  }

  ngOnDestroy() {
    this.valueChanges$$.unsubscribe();
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  /**
   * On close, emit the cancel event
   */
  onClose() {
    this.cancel.emit();
  }

  onSubmit(data: DataSelectionData) {
    const featureStore = this.workspace.entityStore as FeatureStore;
    const storeFeatures = featureStore.all();

    const buffer = data.buffer ? +data.buffer : undefined;

    const formFeature: Feature = {
      type: FEATURE,
      geometry: data.geometry,
      projection: 'EPSG:4326',
      properties: {}
    };
    let olFormFeature = featureToOl(formFeature, 'EPSG:4326');
    if (buffer) {
      const bufferedGeom = bufferOlGeometry(
        olFormFeature.getGeometry(),
        buffer,
        'meters'
      );
      const bufferedFeature: Feature = {
        type: FEATURE,
        geometry: bufferedGeom,
        projection: 'EPSG:4326',
        properties: {}
      };
      olFormFeature = featureToOl(bufferedFeature, 'EPSG:4326');
    }

    const intersectingFeatures = storeFeatures
      .map((storeFeature) => {
        const doesIntersects = doesOlGeometryIntersects(
          featureToOl(storeFeature, 'EPSG:4326').getGeometry(),
          olFormFeature.getGeometry()
        );
        return doesIntersects ? storeFeature : undefined;
      })
      .filter((f) => f);

    let selectedStateToApply = false;
    let exclusive = false;
    if (intersectingFeatures.length) {
      if ([SelectionAction.New, SelectionAction.Add].includes(data.action)) {
        selectedStateToApply = true;
        exclusive = data.action === SelectionAction.New ? true : false;
      } else if (SelectionAction.Remove) {
        selectedStateToApply = false;
        exclusive = false;
      }
      featureStore.state.updateMany(
        intersectingFeatures,
        { selected: selectedStateToApply },
        exclusive
      );
    }
    this.data$.next(
      Object.assign({}, this.data$.getValue(), { geometry: undefined })
    );
  }

  clear() {
    const featureStore = this.workspace.entityStore as FeatureStore;
    featureStore.state.updateAll({ selected: false });
    this.form$.value.control.reset();
    this.setAction(SelectionAction.Add);
    this.data$.next(
      Object.assign({}, this.data$.getValue(), {
        geometry: undefined,
        action: SelectionAction.Add
      })
    );
  }
}
