import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';

import { SearchResultType, SearchResultFormat } from '../shared';
import { SearchResultItemComponent } from './search-result-item.component';

describe('SearchResultItemComponent', () => {
  let component: SearchResultItemComponent;
  let fixture: ComponentFixture<SearchResultItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule
      ],
      declarations: [ SearchResultItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.result = {
      id: '1',
      type: SearchResultType.Feature,
      format: SearchResultFormat.GeoJSON,
      title: 'foo',
      icon: 'bar',
      source: 'foo'
    };
    expect(component).toBeTruthy();
  });
});
