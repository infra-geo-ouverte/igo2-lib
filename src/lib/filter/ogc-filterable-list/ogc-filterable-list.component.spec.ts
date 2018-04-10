import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';

import { FilterableDataSourcePipe } from '../shared';
import { OgcFilterableItemComponent } from '../ogc-filterable-item';
import { OgcFilterableFormComponent } from '../ogc-filterable-form';
import { OgcFilterableListComponent } from './ogc-filterable-list.component';

describe('OgcFilterListComponent', () => {
  let component: OgcFilterableListComponent;
  let fixture: ComponentFixture<OgcFilterableListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule
      ],
      declarations: [
        FilterableDataSourcePipe,
        OgcFilterableListComponent,
        OgcFilterableItemComponent,
        OgcFilterableFormComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OgcFilterableListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.datasources = [];
    expect(component).toBeTruthy();
  });
});
