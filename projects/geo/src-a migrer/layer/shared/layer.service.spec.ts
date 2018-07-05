import { TestBed, inject } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IgoCoreModule } from '../../core';
import { IgoAuthModule } from '../../auth';

import { StyleService } from './style.service';
import { LayerService } from './layer.service';


describe('LayerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        IgoAuthModule.forRoot(),
        IgoCoreModule.forRoot()
      ],
      providers: [
        [{provide: APP_BASE_HREF, useValue : '/' }],
        StyleService,
        LayerService
      ]
    });
  });

  it('should ...', inject([LayerService], (service: LayerService) => {
    expect(service).toBeTruthy();
  }));

});
