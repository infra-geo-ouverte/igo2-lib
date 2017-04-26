import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../../shared';
import { IgoFeatureModule } from '../../../feature';
import { IgoOverlayModule } from '../../../overlay';

import { SearchResultsToolComponent } from './search-results-tool.component';

describe('SearchResultsToolComponent', () => {
  let component: SearchResultsToolComponent;
  let fixture: ComponentFixture<SearchResultsToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
        IgoFeatureModule.forRoot(),
        IgoOverlayModule.forRoot()
      ],
      declarations: [
        SearchResultsToolComponent
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
