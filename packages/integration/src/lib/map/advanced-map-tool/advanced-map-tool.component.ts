import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToolComponent } from '@igo2/common';
import { ContextService, DetailedContext } from '@igo2/context';
import { IgoMap, Layer, VectorLayer } from '@igo2/geo';
import { MapState } from '../map.state';
import { ToolState } from '../../tool/tool.state';

@ToolComponent({
  name: 'advancedMap',
  title: 'igo.integration.tools.advancedMap',
  icon: 'leaf-maple'
})

/**
 * Tool to handle the advanced map tools
 */
@Component({
  selector: 'igo-advanced-map-tool',
  templateUrl: './advanced-map-tool.component.html',
  styleUrls: ['./advanced-map-tool.component.scss']
})

export class AdvancedMapToolComponent implements OnInit, OnDestroy {

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
  applyNewsLayers(e) {
    this.startSwipe(false);
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
