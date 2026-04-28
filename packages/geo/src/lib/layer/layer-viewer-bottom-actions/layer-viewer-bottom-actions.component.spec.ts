import { inputBinding } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OSMDataSource } from '../../datasource/shared/datasources/osm-datasource';
import { TileLayer } from '../../layer/shared/layers/tile-layer';
import { IgoMap } from '../../map';
import { IgoLayerModule } from '../layer.module';
import { LayerController } from '../shared/layer-controller';
import { LayerViewerBottomActionsComponent } from './layer-viewer-bottom-actions.component';

describe('LayerViewerBottomActionsComponent', () => {
  let component: LayerViewerBottomActionsComponent;
  let fixture: ComponentFixture<LayerViewerBottomActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IgoLayerModule, LayerViewerBottomActionsComponent]
    });

    const map = new IgoMap();
    const layer = new TileLayer({
      title: 'test',
      source: new OSMDataSource()
    });
    const controller = new LayerController(map, [layer]);
    controller.select(layer);

    fixture = TestBed.createComponent(LayerViewerBottomActionsComponent, {
      bindings: [
        inputBinding('map', () => map),
        inputBinding('controller', () => controller),
        inputBinding('searchTerm', () => ''),
        inputBinding('viewerOptions', () => ({}))
      ]
    });
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
