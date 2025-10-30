import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { StyleService } from '../style-service/style.service';
import { provideStyle } from '../style.provider';
import { withGeostyler } from './geostyler.provider';

describe('GeostylerService', () => {
  let service: StyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideStyle(withGeostyler())
      ]
    });
    service = TestBed.inject(StyleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLayerOlStyle', () => {
    it('should convert a GeoStyler style to OpenLayersstyle', async () => {
      const result = await service.getStyle({
        editable: false,
        type: 'Geostyler',
        style: {
          name: 'Test Style',
          rules: [
            {
              name: 'Test Rule',
              symbolizers: [
                {
                  kind: 'Fill',
                  color: '#ff0000'
                }
              ]
            }
          ]
        }
      });
      expect(result).toBeTruthy();
      expect(result).toBeDefined();
    });
  });

  describe('getLegendFromLayerStyle', () => {
    it('should generate a legend', async () => {
      const result = await service.getLegend({
        editable: false,
        type: 'Geostyler',
        style: {
          name: 'Style 1',
          rules: [
            {
              name: 'Rule 1',
              symbolizers: [
                {
                  kind: 'Fill',
                  color: '#ff0000'
                }
              ]
            }
          ]
        }
      });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('svg');
    });
  });
  // cp
});
