import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';

import { of } from 'rxjs';

import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import { Legend } from '../../datasource/shared/datasources';
import { Layer } from '../shared/layers';
import { LayerLegendComponent } from './layer-legend.component';

describe('LayerLegendComponent', () => {
  let component: LayerLegendComponent;
  let fixture: ComponentFixture<LayerLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerLegendComponent],
      providers: [
        {
          provide: CapabilitiesService,
          useValue: { getWMSOptions: () => of({}) }
        },
        {
          provide: ConfigService,
          useValue: { getConfig: () => undefined }
        },
        {
          provide: HttpClient,
          useValue: {}
        },
        {
          provide: LanguageService,
          useValue: { translate: { instant: (key: string) => key } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LayerLegendComponent);
    component = fixture.componentInstance;
  });

  it('should initialize legend when layer has no source options', () => {
    const legend: Legend[] = [{ title: 'Legend' }];
    const layer = {
      options: {},
      dataSource: {
        getLegend: vi.fn(() => legend)
      }
    } as unknown as Layer;

    fixture.componentRef.setInput('layer', layer);

    expect(() => component.ngOnInit()).not.toThrow();
    expect(layer.dataSource.getLegend).toHaveBeenCalledWith(
      undefined,
      undefined
    );
    expect(component.legendItems$.value).toEqual(legend);
  });
});
