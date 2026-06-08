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
        name: 'date',
        title: 'Date',
        type: 'date',
        options: {
          cols: 2
        },
        inputs: {
          showLabel: true,
          placeholder: 'Select date',
          calendarType: 'date'
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
      date: '2026-05-29'
    });
  }

  clearForm(): void {
    this.form$.value?.control.reset();
  }

  onSubmit(data: object): void {
    alert(JSON.stringify(data));
  }
}
