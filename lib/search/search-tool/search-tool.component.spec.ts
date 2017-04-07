import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { MaterialModule } from '@angular/material';

import { RequestService, MessageService } from '../../core';

import {
  SearchSource,
  SearchService,
  SearchSourceService,
  provideSearchSourceService,
  IgoSearchModule
} from '../search';

import { SearchToolComponent } from './search-tool.component';

describe('SearchToolComponent', () => {
  let component: SearchToolComponent;
  let fixture: ComponentFixture<SearchToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MaterialModule, IgoSearchModule ],
      declarations: [],
      providers: [
        RequestService,
        MessageService,
        SearchSource,
        SearchService,
        provideSearchSourceService()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', inject([SearchSourceService], (service: SearchSourceService) => {
    expect(component).toBeTruthy();
  }));
});
