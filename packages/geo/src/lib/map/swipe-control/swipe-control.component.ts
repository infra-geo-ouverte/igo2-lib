import { Component, Input, OnInit } from '@angular/core';
import { Layer, TileLayer } from '../../layer';

import { IgoMap } from '../shared/map';
import { getRenderPixel } from 'ol/render';

@Component({
  selector: 'igo-swipe-control',
  templateUrl: './swipe-control.component.html',
  styleUrls: ['./swipe-control.component.scss']
})
export class SwipeControlComponent implements OnInit {

  @Input() map: IgoMap;

  constructor() { }
  public swipe: any;
  private layers: Layer[];
  private layer: Layer;

  ngOnInit() {
    this.getSwipe();
    this.eventListener();
  }

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

}
