import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { provideTranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { FormStepperDialogComponent } from './form-stepper-dialog.component';

describe('FormStepperDialogComponent', () => {
  let component: FormStepperDialogComponent;
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let data$: BehaviorSubject<Record<string, unknown>>;

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn()
    };
    data$ = new BehaviorSubject<Record<string, unknown>>({});

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            steps: [{ label: 'Country', form: { formFieldConfigs: [] } }],
            labels: { cancelButton: 'Skip' },
            data$
          }
        },
        {
          provide: MatDialogRef,
          useValue: dialogRef
        }
      ]
    });

    component = TestBed.runInInjectionContext(
      () => new FormStepperDialogComponent()
    );
  });

  it('should push intermediate step data to the shared subject', () => {
    component.onDataChange({ country: 'canada' });

    expect(data$.value).toEqual({ country: 'canada' });
  });

  it('should default the dialog title to a translation key', () => {
    expect(component.data.title).toBe('igo.common.formDialog.title');
  });

  it('should pass provided labels through unchanged', () => {
    expect(component.data.labels).toEqual({ cancelButton: 'Skip' });
  });

  it('should close the dialog with the final result', () => {
    component.onCompleted({ country: 'canada', city: 'montreal' });

    expect(data$.value).toEqual({ country: 'canada', city: 'montreal' });
    expect(dialogRef.close).toHaveBeenCalledWith({
      country: 'canada',
      city: 'montreal'
    });
  });
});
