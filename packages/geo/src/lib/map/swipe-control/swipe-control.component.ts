import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { Layer } from '../../layer';
import { IgoMap } from '../shared/map';
import { getRenderPixel } from 'ol/render';
import { Subscription } from 'rxjs';

/**
 * Tool to swipe the layers
 */
@Component({
  selector: 'igo-swipe-control',
  templateUrl: './swipe-control.component.html',
  styleUrls: ['./swipe-control.component.scss']
})

export class SwipeControlComponent implements AfterViewInit, OnDestroy {
  /**
   * Get an active color
   */
  @Input() color: string;

  /**
   * Get an active map
   */
  @Input() map: IgoMap;

  /**
   * The list of layers for swipe
   */
  private layers: Layer[];

  /**
   * Final position of the swiped element
   */
  private pos1: number;

  /**
   * Intermediate position of the swiped element
   */
  private pos3: number;

  /**
   * State of draggable action
   */
  private inDragAction: boolean = false;

  /**
   * Listener of toggle from advanced-map-tool
   */
  private swipeEnabled$$: Subscription;

  /**
   * Binder of prerender on the same element
   */
  private boundPrerender = this.prerender.bind(this);

  constructor() {
   }

  /**
   * Get the list of layers for swipe and activate of deactivate the swipe
   * @internal
   */
  ngAfterViewInit(): void {
    this.getListOfLayers();
    this.swipeEnabled$$ = this.map.swipeEnabled$.subscribe(value => {
        value ? this.displaySwipe() : this.displaySwipeOff();
      });
  }

  /**
   * Clear the overlay layer and any interaction added by this component.
   * @internal
   */
  ngOnDestroy(): void {
    this.swipeEnabled$$.unsubscribe();
    this.map.swipeEnabled$.unsubscribe();
    this.displaySwipeOff();
  }

  /**
   * Display a swipe-element and render the layers
   */
  displaySwipe() {
    this.swipeId.style.visibility = 'visible';
    this.layers.map(layer => layer.ol.on('prerender', this.boundPrerender));
    this.layers.map(layer => layer.ol.on('postrender', this.postrender));
    this.map.ol.render();
  }

  /**
   * Clear a swipe-element and render the layers on the initial state
   */
  displaySwipeOff() {
    this.swipeId.style.visibility = 'hidden';
    this.layers.map(layer => layer.ol.un('prerender', this.boundPrerender));
    this.layers.map(layer => layer.ol.un('postrender', this.postrender));
    this.map.ol.render();
    this.layers = [];
  }

  /**
   * Getter of element
   */
  get swipeId() {
    return  document.getElementById('igo-layer-swipe');
  }

  /**
   * Get the list of layers for swipe
   */
  getListOfLayers() {
    this.map.selectedFeatures$.subscribe(layers => {
      this.layers = [];
      if (layers !== null) {
        for (const layer of layers) {
          if (!this.layers.includes(layer)) {
            this.layers.push(layer);
          }
        }
      }
    });
  }

  /**
   * Get a position of click or touch
   */
  dragDown(event) {
    this.inDragAction = true;
    event.preventDefault();
    if (event.type === 'mousedown'){
        this.pos3 = event.clientX;
        this.mouseSwipe();
        document.onmouseup = this.closeDragMouseElement;
    }
    else if (event.type === 'touchstart'){
        document.getElementById('arrows').style.visibility = 'hidden';
        this.pos3 = event.touches[0].clientX;
        this.touchSwipe();
        document.ontouchend = this.closeDragTouchElement;
    }
  }

  /**
   * Moving a line with a mouse
   */
  mouseSwipe(){
    document.addEventListener('mousemove', event => {
      if (this.inDragAction){
        event.preventDefault();
        this.pos1 = this.pos3 - event.clientX;
        this.pos3 = event.clientX;
        this.swipeId.style.left = (this.swipeId.offsetLeft - this.pos1) + 'px';
      }
      this.map.ol.render();
    });
  }

  /**
   * Moving a line with a touch
   */
  touchSwipe(){
    document.addEventListener('touchmove', event => {
      if (this.inDragAction) {
        event.preventDefault();
        document.getElementById('arrows').style.visibility = 'hidden';
        this.pos1 = this.pos3 - event.changedTouches[0].clientX;
        this.pos3 = event.changedTouches[0].clientX;
        this.swipeId.style.left = (this.swipeId.offsetLeft - this.pos1) + 'px';
      }
      this.map.ol.render();
    });
  }

  /**
   * Deactivate a listener of a mouse-action
   */
  closeDragMouseElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    this.inDragAction = false;
  }

  /**
   * Deactivate a listener of a touch-action
   */
  closeDragTouchElement() {
    document.ontouchend = null;
    document.ontouchmove = null;
    document.getElementById('arrows').style.visibility = 'visible';
    this.inDragAction = false;
  }

  /**
   * Cut the image of a layer by the position of swiped-element
   */
  prerender(event) {
      const ctx = event.context;
      const mapSize = this.map.ol.getSize();
      const width = this.swipeId.offsetLeft ;
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
  }

  /**
   * Save a current state of the context
   */
  postrender(event){
    event.context.restore();
    event.context.save();
  }
}
