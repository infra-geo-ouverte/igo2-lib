import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators  } from '@angular/forms';
import { ToolComponent } from '@igo2/common';
import { ContextExportService, ContextService, DetailedContext } from '@igo2/context';
import { IgoMap, Layer, VectorLayer } from '@igo2/geo';
import { LanguageService, StorageScope, StorageService  } from '@igo2/core';
import { take } from 'rxjs/operators';
import { MapState } from '../map.state';
import { BehaviorSubject, Subject } from 'rxjs';




@ToolComponent({
  name: 'advancedMap',
  title: 'igo.integration.tools.advancedMap',
  icon: 'leaf-maple'
})

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
  // public selectedFeatures$ = new BehaviorSubject<Layer[]>(null);

  get map(): IgoMap {
    return this.mapState.map;
  }

    constructor(
    public mapState: MapState,
    private contextService: ContextService,
    private formBuilder: FormBuilder,
    private contextExportService: ContextExportService,
    private storageService: StorageService) {
      this.buildForm();
    }

  ngOnInit() {
    this.layerList = this.contextService.getContextLayers(this.map);
    this.userControlledLayerList = this.layerList.filter(layer => layer.showInLayerList);
    // this.checkSwipeToggle();
  }
  ngOnDestroy(){
    this.swipe = false;
    this.map.swipeEnabled$.next(this.swipe);
  }


  checkSwipeToggle(){
    // if (this.storageService.get('swipeToggle') === true){
    //   this.swipe = true;
    // }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      layers: ['', [Validators.required]],
      name: ['', [Validators.required]]
    });
  }

  startSwipe(toggle: boolean){
    this.swipe = toggle;
    this.map.swipeEnabled$.next(toggle);
    this.listForSwipe = [];
    for (const layer of this.form.value.layers) {
      this.listForSwipe.push(layer);
    }
    this.map.selectedFeatures$.next(this.listForSwipe);
  }

  applyNewsLayers(e) {
    this.startSwipe(false);
  }

  selectAll(e) {
    if (e._selected) {
      this.form.controls.layers.setValue(this.userControlledLayerList);
      e._selected = true;
    }
    if (e._selected === false) {
      this.form.controls.layers.setValue([]);
    }
    this.startSwipe(this.swipe);
  }
}
