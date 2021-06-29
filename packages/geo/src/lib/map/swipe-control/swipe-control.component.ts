import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Layer, TileLayer } from '../../layer';

import { IgoMap } from '../shared/map';
import { getRenderPixel } from 'ol/render';
import { Subscription } from 'rxjs';

@Component({
  selector: 'igo-swipe-control',
  templateUrl: './swipe-control.component.html',
  styleUrls: ['./swipe-control.component.scss']
})
export class SwipeControlComponent implements OnInit, AfterViewInit, OnDestroy {
  // @Input() map: IgoMap;


  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;
  private swipedLayers: Layer[] = [];
  private layers: Layer[];
  private pos1: number;
  private pos3: number;
  private inDragAction: boolean = false;
  private swipeEnabled$$: Subscription;
  public doSwipe: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.checkEnabled();
  }

  ngOnDestroy(): void {
    this.swipeEnabled$$.unsubscribe();
    this.map.swipeEnabled$.unsubscribe();
    this.displayOff();
  }

  checkEnabled() {
    this.swipeEnabled$$ = this.map.swipeEnabled$.subscribe(value => {
        value ? this.display() : this.displayOff();
      });
  }

  display() {
      this.doSwipe = true;
      this.swipeId.style.visibility = 'visible';
      this.getListOfLayers();
      this.renderLayers(this.layers);
      this.map.ol.render();
  }

  displayOff() {
    this.doSwipe = false;
    this.swipeId.style.visibility = 'hidden';
    this.getListOfLayers();
    this.renderLayers(this.layers);
    this.map.ol.render();
    this.swipedLayers.map(layer => layer.ol.un('prerender', (event) => {
        event.context.restore();
        event.context.save();
    } ));
    this.swipedLayers = [];
  }

  get swipeId(){
    return  document.getElementById('myswipe');
  }
  getListOfLayers() {
    this.layers = [];
    if (this.doSwipe) {
        this.map.selectedFeatures$.subscribe(layers => {
            if (layers !== null) {
                for (const layer of layers) {
                  if (!this.layers.includes(layer)) {
                    this.layers.push(layer);
                  }
                }
            }
        });
    }
}

  dragDown(event) {
    this.inDragAction = true;
    event.preventDefault();
    if (event.type === 'mousdown'){
        this.pos3 = event.clientX;
        document.onmouseup = this.closeDragMouseElement;
    }
    else if (event.type === 'touchstart'){
        document.getElementById('arrows').style.visibility = 'hidden';
        this.pos3 = event.touches[0].clientX;
        document.ontouchend = this.closeDragTouchElement;
    }
  }

  elementDrag(event){
    if (this.inDragAction){
          event.preventDefault();
          if (event.type === 'mousemove'){
            this.pos1 = this.pos3 - event.clientX;
            this.pos3 = event.clientX;
          }
          else if (event.type === 'touchmove') {
            document.getElementById('arrows').style.visibility = 'hidden';
            this.pos1 = this.pos3 - event.changedTouches[0].clientX;
            this.pos3 = event.changedTouches[0].clientX;
          }
          this.swipeId.style.left = (this.swipeId.offsetLeft - this.pos1) + 'px';
        }
    this.getListOfLayers();
    this.renderLayers(this.layers);
    this.map.ol.render();
  }

  closeDragMouseElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    this.inDragAction = false;
  }

  closeDragTouchElement() {
    document.ontouchend = null;
    document.ontouchmove = null;
    document.getElementById('arrows').style.visibility = 'visible';
    this.inDragAction = false;
  }

  renderLayers(layers: Layer[]){
    for (const layer of layers){
        this.prerender(layer);
        this.postrender(layer);
    }
  }

  prerender(idLayer) {
    idLayer.ol.on('prerender', (event) => {
      const ctx = event.context;
      const mapSize = this.map.ol.getSize();
      const width = this.doSwipe ? this.swipeId.offsetLeft : mapSize[0];
      // const width = this.swipeId.offsetLeft ;
      // let width = document.getElementById('myswipe').offsetLeft ;
      const tl = getRenderPixel(event, [width, 0]);
      const tr = getRenderPixel(event, [0, 0]);
      const bl = getRenderPixel(event, [width, mapSize[1]]);
      const br = getRenderPixel(event, [0, mapSize[1]]);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tl[0], tl[1]);
      ctx.lineTo(bl[0], bl[1]);
      ctx.lineTo(br[0], br[1]);
      ctx.lineTo(tr[0], tr[1]);
      ctx.closePath();
      ctx.clip();
    });
    this.swipedLayers.push(idLayer);
  }

  postrender(idLayer: Layer){
    idLayer.ol.on('postrender', (event) => {
      const ctx = event.context;
      ctx.restore();
    });
  }
}
