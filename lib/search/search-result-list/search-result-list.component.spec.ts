import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';

import { SearchService } from '../shared';
import { SearchResultItemComponent } from '../search-result-item';
import { SearchResultListComponent } from './search-result-list.component';

describe('SearchResultListComponent', () => {
  let component: SearchTResultListComponent;
  let fixture: ComponentFixture<SearchResultListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule
      ],
      declarations: [
        SearchResultListComponent,
        SearchResultItemComponent
      ],
      providers: [
        SearchService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
