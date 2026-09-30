import { TestBed } from '@angular/core/testing';

import { EntityService } from '@igo2/common/entity';

import OlFeature from 'ol/Feature';

import { mergeTestConfig } from '../../../../test-config';
import { TableDataService } from './table-data.service';

describe('TableDataService', () => {
  it('preserves attributes found only on later features', async () => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        providers: [TableDataService, { provide: EntityService, useValue: {} }]
      })
    );
    const service = TestBed.inject(TableDataService);
    const features = [
      new OlFeature({
        firstAttribute: 'first',
        sharedAttribute: 'shared',
        _internal: 'hidden'
      }),
      new OlFeature({
        sharedAttribute: 'shared',
        secondAttribute: 'second'
      })
    ];

    const formatted = await service.formatData(features);

    expect(formatted[0].getProperties()).toEqual({
      firstAttribute: 'first',
      sharedAttribute: 'shared',
      secondAttribute: ''
    });
    expect(formatted[1].getProperties()).toEqual({
      firstAttribute: '',
      sharedAttribute: 'shared',
      secondAttribute: 'second'
    });
  });
});
