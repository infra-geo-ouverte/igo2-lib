import {
  OnInit,
  OnDestroy,
  AfterViewInit,
  Directive,
  Self
} from '@angular/core';

import { Subscription } from 'rxjs';
import { MeasureService } from './measure.service';

import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import { unByKey } from 'ol/Observable';
import { fromCircle } from 'ol/geom/Polygon';
import View from 'ol/View';
import { LineString, Polygon, Circle } from 'ol/geom';

import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { DataSourceService } from '../../datasource/shared/datasource.service';
import { LayerService } from '../../layer/shared/layer.service';
import { OverlayService } from '../../overlay/shared/overlay.service';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { Feature } from '../../feature/shared/feature.interface';
import { FeatureType } from '../../feature/shared/feature.enum';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';

@Directive({
  selector: '[igoMeasure]'
})
export class MeasureDirective implements AfterViewInit, OnDestroy {
  private messageToolElement: Element;
  private messageTool: Overlay;
  private measureToolElement: Element;
  private measureTool: Overlay;
  private type: number;
  private typeSelect$$: Subscription;
  private draw: Draw;
  private listener;
  private sketch;

  get map(): IgoMap {
    return this.component.map;
  }

  constructor(
    @Self() private component: MapBrowserComponent,
    private measureService: MeasureService
  ) {}

  ngAfterViewInit() {
    this.map.ol.on('pointermove', e => this.handlePointerMove(e));
    this.addInteraction();
    this.map.ol.getViewport().addEventListener('mouseout', () => {
      this.messageToolElement.classList.add('hidden');
    });

    this.typeSelect$$ = this.measureService.type$.subscribe(type => {
      this.type = type;
      this.map.ol.removeInteraction(this.draw);
      this.addInteraction();
    });
  }

  ngOnDestroy() {
    this.typeSelect$$.unsubscribe();
  }

  addInteraction() {
    const source = new FeatureDataSource();
    const style = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: '#673ab7',
        width: 2
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#673ab7'
        })
      })
    });

    const layer = new VectorLayer({
      source: source,
      style: style
    });

    this.map.addLayer(layer);

    const fill = new Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    });
    const stroke = new Stroke({
      color: 'rgba(0, 0, 0, 0.5)',
      lineDash: [10, 10],
      width: 2
    });

    let typeSelect = ['LineString', 'Polygon', 'Circle'];

    this.draw = new Draw({
      type: typeSelect[this.type],
      source: source.ol,
      style: new Style({
        stroke: stroke,
        fill: fill,
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: fill
        })
      })
    });

    this.map.ol.addInteraction(this.draw);

    this.createMeasureTool();
    this.createHelpTool();

    this.draw.on('drawstart', e => this.handleStart(e));
    this.draw.on('drawend', () => this.handleEnd());
  }

  handlePointerMove(event) {
    if (event.dragging) {
      return;
    }
    let message = 'Click to start drawing';
    if (this.sketch) {
      const geom = this.sketch.getGeometry();
      if (geom instanceof Polygon) {
        message = 'Click to continue drawing the polygon';
      } else if (geom instanceof Circle) {
        message = 'Click to end drawing the circle';
      } else if (geom instanceof LineString) {
        message = 'Click to continue drawing the line';
      }
    }
    this.messageToolElement.innerHTML = message;
    this.messageTool.setPosition(event.coordinate);
    this.messageToolElement.classList.remove('hidden');
  }

  handleStart(event) {
    this.sketch = event.feature;
    this.listener = this.sketch
      .getGeometry()
      .on('change', e => this.handleChange(e));
  }

  handleEnd() {
    this.measureToolElement.className = 'tooltip tooltip-static';
    this.measureTool.setOffset([0, -7]);
    this.sketch = null;
    this.measureToolElement = null;
    this.createMeasureTool();
    unByKey(this.listener);
  }

  handleChange(event) {
    let tooltipCoord;
    let geom = event.target;
    let output;
    if (geom instanceof Polygon) {
      output = this.measureService.formatArea(geom);
      tooltipCoord = geom.getInteriorPoint().getCoordinates();
    } else if (geom instanceof Circle) {
      const geometry = fromCircle(geom);
      output = this.measureService.formatArea(geometry);
      tooltipCoord = geom.getLastCoordinate();
    } else if (geom instanceof LineString) {
      output = this.measureService.formatLength(geom);
      tooltipCoord = geom.getLastCoordinate();
    }
    this.measureToolElement.innerHTML = output;
    this.measureTool.setPosition(tooltipCoord);
  }

  createHelpTool() {
    if (this.messageToolElement) {
      this.messageToolElement.parentNode.removeChild(this.messageToolElement);
    }
    this.messageToolElement = document.createElement('help');
    this.messageToolElement.className = 'tooltip hidden';
    this.messageTool = new Overlay({
      element: this.messageToolElement,
      offset: [15, 0],
      positioning: 'center-left'
    });
    this.map.ol.addOverlay(this.messageTool);
  }

  createMeasureTool() {
    if (this.measureToolElement) {
      this.measureToolElement.parentNode.removeChild(this.measureToolElement);
    }
    this.measureToolElement = document.createElement('measure');
    this.measureToolElement.className = 'tooltip tooltip-measure';
    this.measureTool = new Overlay({
      element: this.measureToolElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    });
    this.map.ol.addOverlay(this.measureTool);
  }
}
