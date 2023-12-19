import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MONITORING_OPTIONS } from '@igo2/core';

import { MOCK_MONITORING_OPTIONS } from 'packages/core/src/lib/monitoring/__mocks__/monitoring-mock';

import { SharedModule } from '../../shared/shared.module';
import { MonitoringComponent } from './monitoring.component';

describe('MonitoringComponent', () => {
  let component: MonitoringComponent;
  let fixture: ComponentFixture<MonitoringComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [MonitoringComponent],
      providers: [
        { provide: MONITORING_OPTIONS, useValue: MOCK_MONITORING_OPTIONS }
      ]
    });
    fixture = TestBed.createComponent(MonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
