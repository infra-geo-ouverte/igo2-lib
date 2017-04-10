import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';

import { FeatureType, FeatureFormat } from '../shared';
import { FeatureDetailsComponent } from './feature-details.component';

describe('FeatureDetailsComponent', () => {
  let component: FeatureDetailsComponent;
  let fixture: ComponentFixture<FeatureDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule
      ],
      declarations: [ FeatureDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.feature = {
      id: '1',
      type: FeatureType.Feature,
      format: FeatureFormat.GeoJSON,
      title: 'foo',
      icon: 'bar',
      source: 'foo'
    };
    expect(component).toBeTruthy();
  });
});
