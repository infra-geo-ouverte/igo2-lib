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
  private layer: Layer;
  private element: any;
  private pos1: number;
  private pos3 = 700;
  private inDragAction: boolean = false;
  // getElement(): any {
  //   this.element = document.getElementById("myswipe");
  // }

  dragMouseDown(event) {
    this.inDragAction = true;
    // event = event || window.event;
    event.preventDefault();
    this.pos3 = event.clientX;
    document.onmouseup = this.closeDragElement;
    // document.onmousemove = this.elementDrag;
  }

  elementDrag(event) {
    if (this.inDragAction){
      // event = event || window.event;
      event.preventDefault();
      this.pos1 = this.pos3 - event.clientX;
      this.pos3 = event.clientX;
      document.getElementById('myswipe').style.left = (document.getElementById('myswipe').offsetLeft - this.pos1) + 'px';
      }
    this.getListOfLayers();
    this.renderLayers(this.layers);
    this.map.ol.render();
  }

    closeDragElement() {
    console.log('close');
    document.onmouseup = null;
    document.onmousemove = null;
    this.inDragAction = false;
  }

  getListOfLayers(){
    this.layers = this.map.layers;
    // console.log('getlistOfLayers : this.layers = ', this.layers);
  }

  renderLayers(layers: Layer[]){
    for (const layer of layers){
      if (!(layer instanceof TileLayer)){
          this.prerender(layer);
          this.postrender(layer);
      }
    }
  }

  prerender(idLayer: Layer){
    idLayer.ol.on('prerender', (event) => {
      const ctx = event.context;
      const width = ctx.canvas.width * document.getElementById('myswipe').offsetLeft / 1000;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, ctx.canvas.height);
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
/*
  getSwipe(){
    this.swipe = document.getElementById('swipe');
  }

  eventListener(){
    this.swipe.addEventListener(
      'input', () => {
        this.getListOfLayers();
        this.renderLayers(this.layers);
        this.map.ol.render();
      }, false);

  }

  getListOfLayers(){
    this.layers = this.map.layers;
    console.log('getlistOfLayers : this.layers = ', this.layers);
  }

  renderLayers(layers: Layer[]){
    for (const layer of layers){
      if (!(layer instanceof TileLayer)){
          this.prerender(layer);
          this.postrender(layer);
      }
    }
  }

  prerender(idLayer: Layer){
    idLayer.ol.on('prerender', (event) => {
      const ctx = event.context;
      const width = ctx.canvas.width * this.swipe.value / 1000;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, ctx.canvas.height);
      ctx.clip();
      ctx.clip();
    });
  }

  postrender(idLayer: Layer){
    idLayer.ol.on('postrender', (event) => {
      const ctx = event.context;
      ctx.restore();
    });
  }
*/
// }
