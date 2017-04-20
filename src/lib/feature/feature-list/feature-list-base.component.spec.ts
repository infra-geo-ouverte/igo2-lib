import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';

import { FeatureService, FeatureGroupPipe } from '../shared';
import { FeatureItemComponent } from '../feature-item';
import { FeatureListBaseComponent } from './feature-list-base.component';

describe('FeatureListBaseComponent', () => {
  let component: FeatureListBaseComponent;
  let fixture: ComponentFixture<FeatureListBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule
      ],
      declarations: [
        FeatureListBaseComponent,
        FeatureItemComponent,
        FeatureGroupPipe
      ],
      providers: [
        FeatureService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureListBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
