import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IgoCoreModule } from '../../../core';
import { IgoSharedModule } from '../../../shared';
import { IgoAuthModule } from '../../../auth';
import { IgoFilterModule } from '../../../filter';
import { IgoMapModule } from '../../../map';
import { IgoLayerModule } from '../../../layer';
import { IgoCatalogModule } from '../../../catalog';
import { IgoDataSourceModule } from '../../../datasource';

import { CatalogLayersToolComponent } from './catalog-layers-tool.component';

describe('CatalogLayersToolComponent', () => {
  let component: CatalogLayersToolComponent;
  let fixture: ComponentFixture<CatalogLayersToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        IgoCoreModule.forRoot(),
        IgoSharedModule,
        IgoDataSourceModule.forRoot(),
        IgoFilterModule.forRoot(),
        IgoMapModule.forRoot(),
        IgoLayerModule.forRoot(),
        IgoCatalogModule.forRoot(),
        IgoAuthModule.forRoot()
      ],
      declarations: [
        CatalogLayersToolComponent
      ],
      providers: [
        [{provide: APP_BASE_HREF, useValue : '/' }]
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogLayersToolComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
