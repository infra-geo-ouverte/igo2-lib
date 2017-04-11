import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoTestModule } from '../../../test/module';
import { IgoSharedModule } from '../../shared';
import { MessageService, RequestService } from '../../core';
import { IgoMap } from '../../map';

import { CapabilitiesService, LayerService } from '../shared';

import { LayerListComponent } from './layer-list.component';
import { LayerItemComponent } from '../layer-item/layer-item.component';
import { LayerLegendComponent } from '../layer-legend/layer-legend.component';

describe('LayerListComponent', () => {
  let component: LayerListComponent;
  let fixture: ComponentFixture<LayerListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoTestModule,
        IgoSharedModule
      ],
      declarations: [
        LayerListComponent,
        LayerItemComponent,
        LayerLegendComponent
      ],
      providers: [
        CapabilitiesService,
        LayerService,
        MessageService,
        RequestService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.map = new IgoMap();
    expect(component).toBeTruthy();
  });
});
