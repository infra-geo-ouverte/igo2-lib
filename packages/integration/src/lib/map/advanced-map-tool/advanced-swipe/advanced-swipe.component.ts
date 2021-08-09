import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ContextService, DetailedContext } from '@igo2/context';
import { IgoMap, Layer, VectorLayer } from '@igo2/geo';
import { MapState } from '../../map.state';
import { ToolState } from '../../../tool/tool.state';

@Component({
  selector: 'igo-advanced-swipe',
  templateUrl: './advanced-swipe.component.html',
  styleUrls: ['./advanced-swipe.component.scss']
})

export class AdvancedSwipeComponent implements OnInit, OnDestroy {
  public swipe: boolean = false;
  public layerList: Layer[];
  public userControlledLayerList: Layer[];
  public form: FormGroup;
  public layers: VectorLayer[];
  public res: DetailedContext;
  public listForSwipe: Layer[];

  /**
   * Get an active map state
   */
  get map(): IgoMap {
    return this.mapState.map;
  }

  constructor(
    public mapState: MapState,
    private contextService: ContextService,
    private formBuilder: FormBuilder,
    private toolState: ToolState) {
      this.buildForm();
  }

  /**
   * Get the list of layers for swipe
   * @internal
   */
  ngOnInit() {
    this.layerList = this.contextService.getContextLayers(this.map);
    this.userControlledLayerList = this.layerList.filter(layer => (layer.showInLayerList && layer.displayed));
  }

  /**
   * Desactivate the swipe
   * @internal
   */
  ngOnDestroy(){
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
  startSwipe(toggle: boolean){
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
    this.startSwipe(false); // l'approche KISS Keep it simple stupid
    this.startSwipe(true);
    if (e._selected) {e._selected = false; } // ici je décoche "select all" si pas toutes les options sont choisies
    const allLayers = this.userControlledLayerList.length;
    const selectedLayers = this.form.controls.layers.value.length;
    if (selectedLayers === allLayers){
      e._selected = true; // ici je veux cocher "select all" car toutes les options sont choisies
    } // mais je n'arrive pas
    // blue-theme .mat-pseudo-checkbox::after {} - peut être comme ça...
  }

  /**
   * Select all list of layers and restart a tool
   */
  selectAll(e) {
    if (e._selected) {
      this.form.controls.layers.setValue(this.userControlledLayerList);
      e._selected = true;
    }
    if (e._selected === false) {
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
