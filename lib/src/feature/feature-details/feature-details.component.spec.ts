import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';

import { FeatureService } from '../shared';
import { FeatureDetailsComponent } from './feature-details.component';

describe('FeatureDetailsComponent', () => {
  let component: FeatureDetailsComponent;
  let fixture: ComponentFixture<FeatureDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule
      ],
      declarations: [
        FeatureDetailsComponent
      ],
      providers: [
        FeatureService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
