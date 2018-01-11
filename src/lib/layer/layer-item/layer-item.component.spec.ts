import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoTestModule } from '../../../test/module';
import { IgoSharedModule } from '../../shared';
import { OSMDataSource } from '../../datasource';
import { MetadataService } from '../../metadata';
import { MapService } from '../../map';
import { FeatureService } from '../../feature';

import { TileLayer } from '../shared';
import { LayerItemComponent } from './layer-item.component';
import { LayerLegendComponent } from '../layer-legend/layer-legend.component';

describe('LayerItemComponent', () => {
  let component: LayerItemComponent;
  let fixture: ComponentFixture<LayerItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoTestModule,
        IgoSharedModule
      ],
      declarations: [
        LayerItemComponent,
        LayerLegendComponent
      ],
      providers: [
        MetadataService,
        MapService,
        FeatureService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.layer = new TileLayer(new OSMDataSource({title: 'foo'}), {});
    expect(component).toBeTruthy();
  });
});
