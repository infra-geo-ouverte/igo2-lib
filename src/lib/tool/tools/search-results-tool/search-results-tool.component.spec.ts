import { async, ComponentFixture, TestBed } from '@angular/core/testing';


import { IgoCoreModule } from '../../../core';
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
        IgoCoreModule.forRoot(),
        IgoFeatureModule.forRoot(),
        IgoOverlayModule.forRoot(),
        IgoDataSourceModule.forRoot(),
        IgoMapModule.forRoot(),
        IgoLayerModule.forRoot()
      ],
      declarations: [
        SearchResultsToolComponent
      ],
      providers: []
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
