import { Component, Input } from '@angular/core';
import { Layer, TileLayer } from '../../layer';

import { IgoMap } from '../shared/map';
import { getRenderPixel } from 'ol/render';

@Component({
  selector: 'igo-swipe-control',
  templateUrl: './swipe-control.component.html',
  styleUrls: ['./swipe-control.component.scss']
})
export class SwipeControlComponent {
  @Input() map: IgoMap;
  constructor() { }
  public swipe: any;
  private layers: Layer[];
  private pos1: number;
  private pos3: number;
  private inDragAction: boolean = false;


  get swipeId(){
    return  document.getElementById('myswipe');
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

  getListOfLayers(){
    this.layers = this.map.layers;
  }

  renderLayers(layers: Layer[]){
    for (const layer of layers){
      if (!(layer instanceof TileLayer)){
          this.prerender(layer);
          this.postrender(layer);
      }
    }
  }

  prerender(idLayer) {
    idLayer.ol.on('prerender', (event) => {
      const ctx = event.context;
      const mapSize = this.map.ol.getSize();
      const width = this.swipeId.offsetLeft ;
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
  }

  postrender(idLayer: Layer){
    idLayer.ol.on('postrender', (event) => {
      const ctx = event.context;
      ctx.restore();
    });
  }
}
