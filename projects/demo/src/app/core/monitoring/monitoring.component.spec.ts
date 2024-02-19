import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MONITORING_OPTIONS } from '@igo2/core';

import { MOCK_MONITORING_OPTIONS } from 'packages/core/src/lib/monitoring/__mocks__/monitoring-mock';

import { AppMonitoringComponent } from './monitoring.component';

describe('MonitoringComponent', () => {
  let component: AppMonitoringComponent;
  let fixture: ComponentFixture<AppMonitoringComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppMonitoringComponent],
      providers: [
        { provide: MONITORING_OPTIONS, useValue: MOCK_MONITORING_OPTIONS }
      ]
    });
    fixture = TestBed.createComponent(AppMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
