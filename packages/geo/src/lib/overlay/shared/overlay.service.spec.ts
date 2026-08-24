import { TestBed } from '@angular/core/testing';

import { FeatureDataSource } from '../../datasource/shared/datasources';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { IgoMap } from '../../map/shared/map';
import { OverlayService } from './overlay.service';

describe('OverlayService', () => {
  it('should create and attach an overlay without exposing LayerService', () => {
    TestBed.configureTestingModule({});
    const map = new IgoMap();

    const overlay = TestBed.inject(OverlayService).create(map);

    expect(overlay.layer).toBeInstanceOf(VectorLayer);
    expect(overlay.dataSource).toBeInstanceOf(FeatureDataSource);
    expect(map.ol.getLayers().getArray()).toContain(overlay.layer.ol);
  });
});
