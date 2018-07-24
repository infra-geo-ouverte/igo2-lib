import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IgoCoreModule } from '../../../core';
import { IgoAuthModule } from '../../../auth';
import { IgoSharedModule } from '../../../shared';
import { IgoFilterModule } from '../../../filter';
import { IgoMapModule } from '../../../map';
import { IgoCatalogModule } from '../../../catalog';
import { IgoToolModule } from '../../../tool';

import { CatalogToolComponent } from './catalog-tool.component';

describe('CatalogToolComponent', () => {
  let component: CatalogToolComponent;
  let fixture: ComponentFixture<CatalogToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        IgoCoreModule.forRoot(),
        IgoAuthModule.forRoot(),
        IgoSharedModule,
        IgoFilterModule.forRoot(),
        IgoMapModule.forRoot(),
        IgoCatalogModule.forRoot(),
        IgoToolModule.forRoot()
      ],
      declarations: [],
      providers: [
        [{provide: APP_BASE_HREF, useValue : '/' }]
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogToolComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
