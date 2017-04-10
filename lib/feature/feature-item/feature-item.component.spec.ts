import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';

import { FeatureType, FeatureFormat } from '../shared';
import { FeatureItemComponent } from './feature-item.component';

describe('FeatureItemComponent', () => {
  let component: FeatureItemComponent;
  let fixture: ComponentFixture<FeatureItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule
      ],
      declarations: [ FeatureItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureItemComponent);
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
