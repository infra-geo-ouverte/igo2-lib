import { TestBed } from '@angular/core/testing';
import { NetworkService } from '@igo2/core';

describe('MapLayerDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [NetworkService]
  });

    it('should create an instance', () => {
        expect(true).toBeTruthy();
        });
    });
});
