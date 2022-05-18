import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleFeatureListHeaderComponent } from './simple-feature-list-header.component';

describe('SimpleFeatureListHeaderComponent', () => {
  let component: SimpleFeatureListHeaderComponent;
  let fixture: ComponentFixture<SimpleFeatureListHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleFeatureListHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleFeatureListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
