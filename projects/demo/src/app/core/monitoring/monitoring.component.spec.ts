import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  MOCK_MONITORING_OPTIONS,
  MONITORING_OPTIONS
} from '@igo2/core/monitoring';

import { mergeTestConfig } from 'projects/demo/src/test-config';

import { AppMonitoringComponent } from './monitoring.component';

describe('MonitoringComponent', () => {
  let component: AppMonitoringComponent;
  let fixture: ComponentFixture<AppMonitoringComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [AppMonitoringComponent],
        providers: [
          { provide: MONITORING_OPTIONS, useValue: MOCK_MONITORING_OPTIONS }
        ]
      })
    );
    fixture = TestBed.createComponent(AppMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
