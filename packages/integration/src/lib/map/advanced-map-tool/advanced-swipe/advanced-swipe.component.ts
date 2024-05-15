import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { IgoIconComponent, LAYER_PLUS_ICON } from '@igo2/common/icon';
import { ContextService, DetailedContext } from '@igo2/context';
import { IgoLanguageModule } from '@igo2/core/language';
import { IgoMap, Layer, VectorLayer } from '@igo2/geo';

import { ToolState } from '../../../tool/tool.state';
import { MapState } from '../../map.state';

@Component({
  selector: 'igo-advanced-swipe',
  templateUrl: './advanced-swipe.component.html',
  styleUrls: ['./advanced-swipe.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    NgFor,
    MatSlideToggleModule,
    MatListModule,
    MatIconModule,
    IgoLanguageModule,
    IgoIconComponent
  ]
})
export class AdvancedSwipeComponent implements OnInit, OnDestroy {
  public swipe: boolean = false;
  public layerList: Layer[];
  public userControlledLayerList: Layer[];
  public form: UntypedFormGroup;
  public layers: VectorLayer[];
  public res: DetailedContext;
  public listForSwipe: Layer[];

  layerPlusIcon = LAYER_PLUS_ICON;

  /**
   * Get an active map state
   */
  get map(): IgoMap {
    return this.mapState.map;
  }

  constructor(
    public mapState: MapState,
    private contextService: ContextService,
    private formBuilder: UntypedFormBuilder,
    private toolState: ToolState
  ) {
    this.buildForm();
  }

  /**
   * Get the list of layers for swipe
   * @internal
   */
  ngOnInit() {
    this.map.layers$.subscribe(
      (ll) =>
        (this.userControlledLayerList = ll.filter(
          (layer) =>
            !layer.baseLayer && layer.showInLayerList && layer.displayed
        ))
    );
  }

  /**
   * Desactivate the swipe
   * @internal
   */
  ngOnDestroy() {
    this.swipe = false;
    this.map.swipeEnabled$.next(this.swipe);
  }

  /**
   * Build a form for choise of the layers
   */
  private buildForm() {
    this.form = this.formBuilder.group({
      layers: ['', [Validators.required]]
    });
  }

  /**
   * Activate the swipe, send a list of layers for a swipe-tool
   */
  startSwipe(toggle: boolean) {
    this.swipe = toggle;
    this.map.swipeEnabled$.next(toggle);
    this.listForSwipe = [];
    for (const layer of this.form.value.layers) {
      this.listForSwipe.push(layer);
    }
    this.map.selectedFeatures$.next(this.listForSwipe);
  }

  /**
   * Restart a swipe for a new layers-list
   */
  applyNewLayers(e) {
    this.startSwipe(false); // l'approche KISS
    this.startSwipe(true);
    if (e._selected) {
      e._selected = false;
    }
    const allLayers = this.userControlledLayerList.length;
    const selectedLayers = this.form.controls.layers.value.length;
    if (selectedLayers === allLayers) {
      e._selected = true;
    }
  }

  /**
   * Select all list of layers and restart a tool
   */
  selectAll(e) {
    if (e._selected) {
      this.form.controls.layers.setValue(this.userControlledLayerList);
      e._selected = true;
    } else {
      this.form.controls.layers.setValue([]);
    }
    this.startSwipe(false);
    this.startSwipe(true);
  }

  /**
   * Open search tool
   */
  searchEmit() {
    this.toolState.toolbox.activateTool('searchResults');
  }

  /**
   * Open catalog
   */
  catalogEmit() {
    this.toolState.toolbox.activateTool('catalog');
  }

  /**
   * Open context manager
   */
  contextEmit() {
    this.toolState.toolbox.activateTool('contextManager');
  }
}
