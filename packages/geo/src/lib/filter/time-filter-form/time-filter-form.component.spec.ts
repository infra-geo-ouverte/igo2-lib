import { ComponentFixture, TestBed } from '@angular/core/testing';

import { vi } from 'vitest';

import { TimeFilterStyle, TimeFilterType } from '../shared/time-filter.enum';
import { TimeFilterOptions } from '../shared/time-filter.interface';
import { TimeFilterFormComponent } from './time-filter-form.component';

describe('TimeFilterFormComponent', () => {
  let component: TimeFilterFormComponent;
  let fixture: ComponentFixture<TimeFilterFormComponent>;

  const min = '1980-01-01T05:00:00Z';
  const max = '2020-03-29T05:00:00Z';

  // Mock layer object
  const mockLayer = {
    dataSource: {
      ol: {
        getParams: vi.fn(() => ({}))
      }
    }
  } as any;

  const dateX = '1999-02-02T15:00:00-0500';
  const dateY = '1999-02-03T11:00:00-0500';
  const dateZ = '1999-02-03T17:00:00-0500';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeFilterFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TimeFilterFormComponent);
    component = fixture.componentInstance;

    // Set the required layer input before any tests that trigger ngOnInit
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('layer', mockLayer);
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct min/max values', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle calendar date type without range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.date = new Date('1999-02-02T15:00:00-0500');
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle calendar date type with range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null,
      range: true
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.startDate = new Date('1999-02-02T15:00:00-0500');
    component.endDate = new Date('1999-02-03T11:00:00-0500');
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle calendar datetime type with range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATETIME,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null,
      range: true
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.startDate = new Date('1999-02-02T15:00:00-0500');
    component.endDate = new Date('1999-02-03T11:00:00-0500');
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle calendar datetime type without range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATETIME,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.date = new Date('1999-02-02T15:00:00-0500');
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle time type with range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.TIME,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      range: true
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.startDate = new Date('1999-02-02T15:00:00-0500');
    component.endDate = new Date('1999-02-03T17:00:00-0500');
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle slider date type', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.SLIDER,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.date = new Date('1999-02-02T15:00:00-0500');
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle slider date type with custom step', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.SLIDER,
      timeInterval: 2000,
      min: min,
      max: max,
      step: 172800000
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    expect(component.mySlider()?.step).toBe(172800000);
    component.date = new Date('1999-02-02T15:00:00-0500');
    component.date = new Date(
      component.date.getTime() + (component.mySlider()?.step || 0)
    );
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle slider time type', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.TIME,
      style: TimeFilterStyle.SLIDER,
      timeInterval: 2000,
      min: min,
      max: max
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    expect(component.mySlider()?.step).toBe(3600000);
    component.date = new Date('1999-02-02T15:00:00-0500');
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should emit dateChange event on handleDateChange', async () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.CALENDAR,
      min: min,
      max: max,
      range: true
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();

    const emitPromise = new Promise((resolve) => {
      component.dateChange.subscribe((value) => {
        expect(Array.isArray(value)).toBe(true);
        resolve(value);
      });
    });

    component.startDate = new Date('1999-02-02T15:00:00-0500');
    component.endDate = new Date('1999-02-03T11:00:00-0500');
    component.handleDateChange();

    await emitPromise;
  });

  it('should handle calendar date type without range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.date = new Date(dateX);
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle calendar date type with range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null,
      range: true
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.startDate = new Date(dateX);
    component.endDate = new Date(dateY);
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle calendar datetime type with range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATETIME,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null,
      range: true
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.startDate = new Date(dateX);
    component.endDate = new Date(dateY);
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle calendar datetime type without range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATETIME,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.date = new Date(dateX);
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle time type with range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.TIME,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      range: true
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.startDate = new Date(dateX);
    component.endDate = new Date(dateZ);
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle time type without range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.TIME,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      range: false
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.date = new Date(dateX);
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle slider date type', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.SLIDER,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.date = new Date(dateX);
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle slider date type with range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.SLIDER,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null,
      range: true
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.date = new Date(dateX);
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle slider datetime type without range', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATETIME,
      style: TimeFilterStyle.SLIDER,
      timeInterval: 2000,
      min: min,
      max: max
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    component.date = new Date(dateX);
    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle slider date type with custom step', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.SLIDER,
      timeInterval: 2000,
      min: min,
      max: max,
      step: 172800000
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    // check step
    expect(component.mySlider()?.step).toBe(172800000);
    component.date = new Date(dateX);

    // add 1 step
    component.date = new Date(
      component.date.getTime() + (component.mySlider()?.step || 0)
    );

    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should handle slider time type', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.TIME,
      style: TimeFilterStyle.SLIDER,
      timeInterval: 2000,
      min: min,
      max: max
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();
    // check step
    expect(component.mySlider()?.step).toBe(3600000);
    component.date = new Date(dateX);

    component.handleDateChange();

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should have correct min/max values', () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.CALENDAR,
      timeInterval: 2000,
      min: min,
      max: max,
      step: null
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    expect(component.min.toISOString()).toBe(new Date(min).toISOString());
    expect(component.max.toISOString()).toBe(new Date(max).toISOString());
  });

  it('should emit dateChange event on handleDateChange', async () => {
    const testOptions: TimeFilterOptions = {
      type: TimeFilterType.DATE,
      style: TimeFilterStyle.CALENDAR,
      min: min,
      max: max,
      range: true
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', testOptions);
    });

    fixture.detectChanges();

    const emitPromise = new Promise((resolve) => {
      component.dateChange.subscribe((value) => {
        expect(Array.isArray(value)).toBe(true);
        resolve(value);
      });
    });

    component.startDate = new Date(dateX);
    component.endDate = new Date(dateY);
    component.handleDateChange();

    await emitPromise;
  });
});
