import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureService, FeatureGroupPipe } from '../shared';
import { FeatureItemComponent } from '../feature-item';
import { FeatureListComponent } from './feature-list.component';

describe('FeatureListBaseComponent', () => {
  let component: FeatureListComponent;
  let fixture: ComponentFixture<FeatureListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [
        FeatureListComponent,
        FeatureItemComponent,
        FeatureGroupPipe
      ],
      providers: [FeatureService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
