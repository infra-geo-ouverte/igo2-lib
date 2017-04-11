import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoTestModule } from '../../test.module';
import { IgoSharedModule } from '../../shared';

import { OSMLayer } from '../shared';
import { LayerLegendComponent } from './layer-legend.component';

describe('LayerLegendComponent', () => {
  let component: LayerLegendComponent;
  let fixture: ComponentFixture<LayerLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoTestModule,
        IgoSharedModule
      ],
      declarations: [
        LayerLegendComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerLegendComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.layer = new OSMLayer({title: 'foo', type: 'osm'});
    expect(component).toBeTruthy();
  });
});
