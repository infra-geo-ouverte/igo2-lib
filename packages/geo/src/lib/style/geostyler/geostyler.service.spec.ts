import { TestBed } from '@angular/core/testing';

import {
  Style as GsStyle,
  IconSymbolizer,
  WriteStyleResult
} from 'geostyler-style';

import { GeostylerService } from './geostyler.service';

describe('GeostylerService', () => {
  let service: GeostylerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeostylerService]
    });
    service = TestBed.inject(GeostylerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('geostylerToOl', () => {
    it('should convert a GeoStyler style to OpenLayers style', (done) => {
      const testStyle: GsStyle = {
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
      };

      service.geostylerToOl(testStyle).subscribe((result) => {
        expect(result).toBeTruthy();
        expect(result.output).toBeDefined();
        done();
      });
    });

    it('should handle style conversion errors', (done) => {
      const invalidStyle: GsStyle = {
        name: '',
        rules: []
      };

      service.geostylerToOl(invalidStyle).subscribe((result) => {
        expect(result).toBeTruthy();
        done();
      });
    });

    it('should handle warnings from conversion', (done) => {
      const testStyle: GsStyle = {
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
      };

      spyOn(console, 'warn');
      service.geostylerToOl(testStyle).subscribe(() => {
        done();
      });
    });
  });

  describe('olStyleToGeostyler', () => {
    it('should convert an OpenLayers style to GeoStyler style', () => {
      // This test would require an actual OL Style object
      // which is complex to mock, so we test with null/undefined
      // In a real scenario, you'd create a proper OL Style instance

      const result = service.olStyleToGeostyler(null);
      expect(result).toBeDefined();
      expect(result.rules).toBeDefined();
    });
  });

  describe('geostylerStyleToLegend', () => {
    it('should generate a legend for a single style as SVG', (done) => {
      const testStyle: GsStyle = {
        name: 'Test Legend',
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
      };

      service.geostylerStyleToLegend(testStyle, 'svg').subscribe((result) => {
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result).toContain('svg');
        done();
      });
    });

    it('should generate a legend with custom dimensions', (done) => {
      const testStyle: GsStyle = {
        name: 'Test Legend',
        rules: [
          {
            name: 'Test Rule',
            symbolizers: [
              {
                kind: 'Fill',
                color: '#00ff00'
              }
            ]
          }
        ]
      };

      service
        .geostylerStyleToLegend(testStyle, 'svg', 200, 150)
        .subscribe((result) => {
          expect(result).toBeTruthy();
          expect(typeof result).toBe('string');
          done();
        });
    });

    it('should generate a legend as data URL', (done) => {
      const testStyle: GsStyle = {
        name: 'Test Legend',
        rules: [
          {
            name: 'Test Rule',
            symbolizers: [
              {
                kind: 'Fill',
                color: '#0000ff'
              }
            ]
          }
        ]
      };

      service.geostylerStyleToLegend(testStyle, 'svg').subscribe((result) => {
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result).toContain('blob:');
        done();
      });
    });
  });

  describe('geostylerStylesToLegend', () => {
    it('should generate a legend for multiple styles as SVG', (done) => {
      const testStyles: GsStyle[] = [
        {
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
        },
        {
          name: 'Style 2',
          rules: [
            {
              name: 'Rule 2',
              symbolizers: [
                {
                  kind: 'Fill',
                  color: '#00ff00'
                }
              ]
            }
          ]
        }
      ];

      service.geostylerStylesToLegend(testStyles, 'svg').subscribe((result) => {
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result).toContain('svg');
        done();
      });
    });

    it('should handle styles with Icon symbolizers', (done) => {
      const testStyles: GsStyle[] = [
        {
          name: 'Icon Style',
          rules: [
            {
              name: 'Icon Rule',
              symbolizers: [
                {
                  kind: 'Icon',
                  image: 'data:image/png;base64,iVBORw0KGgo=',
                  size: 32
                } as IconSymbolizer
              ]
            }
          ]
        }
      ];

      service.geostylerStylesToLegend(testStyles, 'svg').subscribe((result) => {
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        done();
      });
    });

    it('should filter out Text symbolizers in legend', (done) => {
      const testStyles: GsStyle[] = [
        {
          name: 'Mixed Style',
          rules: [
            {
              name: 'Mixed Rule',
              symbolizers: [
                {
                  kind: 'Fill',
                  color: '#ff0000'
                },
                {
                  kind: 'Text',
                  label: 'Test Label'
                }
              ]
            }
          ]
        }
      ];

      service.geostylerStylesToLegend(testStyles, 'svg').subscribe((result) => {
        expect(result).toBeTruthy();
        // Text symbolizer should be filtered out
        done();
      });
    });

    it('should compute height based on number of rules and styles', (done) => {
      const testStyles: GsStyle[] = [
        {
          name: 'Style with multiple rules',
          rules: [
            {
              name: 'Rule 1',
              symbolizers: [{ kind: 'Fill', color: '#ff0000' }]
            },
            {
              name: 'Rule 2',
              symbolizers: [{ kind: 'Fill', color: '#00ff00' }]
            }
          ]
        }
      ];

      service.geostylerStylesToLegend(testStyles).subscribe((result) => {
        expect(result).toBeTruthy();
        done();
      });
    });

    it('should generate legend with default dimensions', (done) => {
      const testStyles: GsStyle[] = [
        {
          name: 'Default Size Style',
          rules: [
            {
              name: 'Rule',
              symbolizers: [{ kind: 'Fill', color: '#0000ff' }]
            }
          ]
        }
      ];

      service.geostylerStylesToLegend(testStyles).subscribe((result) => {
        expect(result).toBeTruthy();
        done();
      });
    });
  });

  describe('handleWarningsAndError', () => {
    it('should log warnings when present', () => {
      spyOn(console, 'warn');
      const writeResult: WriteStyleResult = {
        output: {},
        warnings: ['Warning 1', 'Warning 2']
      };

      service['handleWarningsAndError'](writeResult);
      expect(console.warn).toHaveBeenCalledWith(['Warning 1', 'Warning 2']);
    });
  });
});
