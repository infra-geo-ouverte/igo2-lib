import { TestBed, inject } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { StyleService } from './style.service';
import { LayerService } from './layer.service';

describe('LayerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), HttpClientModule],
      providers: [
        [{ provide: APP_BASE_HREF, useValue: '/' }],
        StyleService,
        LayerService
      ]
    });
  });

  it('should ...', inject([LayerService], (service: LayerService) => {
    expect(service).toBeTruthy();
  }));
});
