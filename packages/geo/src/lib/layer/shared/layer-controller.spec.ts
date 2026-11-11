import { TestBed } from '@angular/core/testing';

import { OSMDataSource } from '../../datasource/shared/datasources/osm-datasource';
import { IgoMap } from '../../map';
import { IgoLayerModule } from '../layer.module';
import { LayerController } from './layer-controller';
import { LayerService } from './layer.service';
import { AnyLayer } from './layers';

describe('LayerController', () => {
  let controller: LayerController;
  let layers: AnyLayer[];

  const ids = () => controller.treeLayers.map((layer) => layer.id);

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [IgoLayerModule] });

    const layerService = TestBed.inject(LayerService);
    layers = ['a', 'b', 'c'].map((id, index) =>
      layerService.createLayer({
        id,
        title: id,
        zIndex: 3 - index,
        source: new OSMDataSource()
      })
    );
    controller = new LayerController(new IgoMap(), layers);
  });

  it('should keep the tree sorted from the top', () => {
    expect(ids()).toEqual(['a', 'b', 'c']);
  });

  it('should move a layer below the last layer', () => {
    controller.moveBelow(layers[2], layers[0]);

    expect(ids()).toEqual(['b', 'c', 'a']);
  });

  it('should move a layer below another layer', () => {
    controller.moveBelow(layers[1], layers[0]);

    expect(ids()).toEqual(['b', 'a', 'c']);
  });

  it('should move a layer above the first layer', () => {
    controller.moveAbove(layers[0], layers[2]);

    expect(ids()).toEqual(['c', 'a', 'b']);
  });
});
