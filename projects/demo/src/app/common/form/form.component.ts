import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import {
  Form,
  FormComponent,
  FormField,
  FormFieldConfig,
  FormGroupComponent,
  FormService
} from '@igo2/common/form';

import { BehaviorSubject, Subscription } from 'rxjs';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    FormComponent,
    FormGroupComponent,
    MatButtonModule,
    AsyncPipe
  ]
})
export class AppFormComponent implements OnInit, OnDestroy {
  private formService = inject(FormService);

  form$ = new BehaviorSubject<Form | undefined>(undefined);

  data$ = new BehaviorSubject<Record<string, unknown> | undefined>(undefined);

  submitDisabled = true;

  private valueChanges$$!: Subscription;

  ngOnInit() {
    const fieldConfigs: FormFieldConfig[] = [
      {
        name: 'id',
        title: 'ID',
        options: {
          cols: 1,
          validator: Validators.required
        },
        inputs: {
          showLabel: true
        }
      },
      {
        name: 'amount',
        title: 'Amout (number)',
        type: 'number',
        options: {
          validator: Validators.required
        }
      },
      {
        name: 'name',
        title: 'Name',
        options: {
          cols: 1,
          validator: Validators.required
        }
      },
      {
        name: 'status',
        title: 'Status',
        type: 'select',
        options: {
          cols: 2
        },
        inputs: {
          showLabel: true,
          choices: [
            { value: 1, title: 'Single' },
            { value: 2, title: 'Married' }
          ]
        }
      },
      {
        name: 'datetime',
        title: 'Date',
        type: 'datetime',
        options: {
          cols: 2,
          validator: Validators.required
        },
        inputs: {
          showLabel: true,
          placeholder: 'Date',
          timePlaceholder: 'Time',
          interval: '20m'
        }
      }
    ];

    const fields: FormField[] = fieldConfigs.map((config: FormFieldConfig) =>
      this.formService.field(config)
    );
    const form: Form = this.formService.form(
      [],
      [this.formService.group({ name: 'info' }, fields)]
    );

    this.valueChanges$$ = form.control.valueChanges.subscribe(() => {
      this.submitDisabled = !form.control.valid;
    });

    this.form$.next(form);
  }

  ngOnDestroy(): void {
    this.valueChanges$$.unsubscribe();
  }

  fillForm(): void {
    this.data$.next({
      id: 1,
      name: 'Bob',
      status: 2,
      datetime: new Date(2026, 4, 29, 16, 42, 0, 0)
    });
  }

  clearForm(): void {
    this.form$.value?.control.reset();
  }

  onSubmit(data: object): void {
    const submitted = data as Record<string, unknown>;
    const localDatetime = this.toDateValue(submitted['datetime']);

    alert(
      JSON.stringify(
        {
          ...submitted,
          localDatetimeIsoLike: localDatetime
            ? this.formatLocalDateTime(localDatetime)
            : null,
          localDatetimeToString: localDatetime ? localDatetime.toString() : null
        },
        null,
        2
      )
    );
  }

  private toDateValue(value: unknown): Date | null {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  private formatLocalDateTime(date: Date): string {
    const pad = (value: number): string => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}
