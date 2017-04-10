import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';
import { RequestService, MessageService } from '../../core';
import { FeatureService } from '../../feature';

import { provideSearchSourceService, SearchSource } from '../module';
import { SearchService, SearchSourceService } from '../shared';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule
      ],
      declarations: [ SearchBarComponent ],
      providers: [
        RequestService,
        MessageService,
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
