import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';

import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';

import { FormStepperComponent } from './form-stepper.component';
import { FormStepperStepConfig } from './form-stepper.interface';

describe('FormStepperComponent', () => {
  let component: FormStepperComponent;

  const steps: FormStepperStepConfig[] = [
    {
      label: 'Country',
      form: {
        formFieldConfigs: [
          {
            name: 'country',
            title: 'Country',
            options: {
              validator: Validators.required
            }
          }
        ]
      }
    },
    {
      label: 'City',
      form: ({ data }) => ({
        formFieldConfigs: [
          {
            name: 'city',
            title:
              data.country === 'canada' ? 'Canadian city' : 'American city',
            options: {
              validator: Validators.required
            }
          }
        ]
      })
    },
    {
      label: 'Details',
      form: {
        formFieldConfigs: [{ name: 'notes', title: 'Notes' }]
      }
    }
  ];

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideTranslateService()]
    });

    component = TestBed.runInInjectionContext(() => new FormStepperComponent());
    Object.assign(component, {
      steps: signal(steps),
      initialData: signal({})
    });
  });

  it('should advance to the next step with data from the previous step', async () => {
    const dataChangeSpy = vi.spyOn(component.dataChange, 'emit');

    component.activeForm().fields[0].control.setValue('canada');

    component.onSubmitStep({ country: 'canada' });
    await Promise.resolve();

    expect(component.stepIndex()).toBe(1);
    expect(component.activeStep().label).toBe('City');
    expect(component.activeForm().fields[0].title).toBe('Canadian city');
    expect(dataChangeSpy).toHaveBeenCalledWith({ country: 'canada' });
  });

  it('should build the step counter label from the resolved labels', () => {
    expect(component.stepCounterLabel()).toBe('Étape 1 de 3');
  });

  it('should let consumers override labels', () => {
    Object.assign(component, {
      labels: signal({ stepCounter: 'Step {{current}} / {{total}}' })
    });

    expect(component.stepCounterLabel()).toBe('Step 1 / 3');
  });

  it('should prevent jumping to a future incomplete step', async () => {
    component.activeForm().fields[0].control.setValue('canada');

    component.onSubmitStep({ country: 'canada' });
    await Promise.resolve();

    component.onSelectedIndexChange(2);
    await Promise.resolve();

    expect(component.stepIndex()).toBe(1);
  });
});
