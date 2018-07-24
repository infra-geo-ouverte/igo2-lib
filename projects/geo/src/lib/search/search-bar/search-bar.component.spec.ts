import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { IgoCoreModule } from '../../core';
import { IgoSharedModule } from '../../shared';
import { FeatureService } from '../../feature';

import { provideSearchSourceService,
         SearchService, SearchSourceService } from '../shared';
import { SearchSource } from '../search-sources';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoCoreModule.forRoot(),
        IgoSharedModule
      ],
      declarations: [ SearchBarComponent ],
      providers: [
        FeatureService,
        SearchService,
        SearchSource,
        provideSearchSourceService()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', inject([SearchSourceService], (service: SearchSourceService) => {
    expect(component).toBeTruthy();
  }));
});
