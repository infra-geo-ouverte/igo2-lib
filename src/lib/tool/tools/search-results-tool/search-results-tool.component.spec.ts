import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IgoCoreModule } from '../../../core';
import { IgoAuthModule } from '../../../auth';
import { IgoSharedModule } from '../../../shared';
import { IgoFeatureModule } from '../../../feature';
import { IgoOverlayModule } from '../../../overlay';
import { IgoDataSourceModule } from '../../../datasource';
import { IgoLayerModule } from '../../../layer';
import { IgoMapModule } from '../../../map';

import { SearchResultsToolComponent } from './search-results-tool.component';

describe('SearchResultsToolComponent', () => {
  let component: SearchResultsToolComponent;
  let fixture: ComponentFixture<SearchResultsToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
        RouterModule.forRoot([]),
        IgoCoreModule.forRoot(),
        IgoAuthModule.forRoot(),
        IgoFeatureModule.forRoot(),
        IgoOverlayModule.forRoot(),
        IgoDataSourceModule.forRoot(),
        IgoMapModule.forRoot(),
        IgoLayerModule.forRoot()
      ],
      declarations: [
        SearchResultsToolComponent
      ],
      providers: [
        [{provide: APP_BASE_HREF, useValue : '/' }]
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultsToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
