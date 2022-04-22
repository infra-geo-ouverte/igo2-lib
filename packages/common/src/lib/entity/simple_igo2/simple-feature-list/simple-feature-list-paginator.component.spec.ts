import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleFeatureListPaginatorComponent } from './simple-feature-list-paginator.component';

describe('SimpleFeatureListPaginatorComponent', () => {
  let component: SimpleFeatureListPaginatorComponent;
  let fixture: ComponentFixture<SimpleFeatureListPaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleFeatureListPaginatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleFeatureListPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
