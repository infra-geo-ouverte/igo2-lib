import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
        NgIf,
        FormComponent,
        FormGroupComponent,
        MatButtonModule,
        AsyncPipe
    ]
})
export class AppFormComponent implements OnInit, OnDestroy {
  form$: BehaviorSubject<Form> = new BehaviorSubject<Form>(undefined);

  data$: BehaviorSubject<object> = new BehaviorSubject<Record<string, any>>(
    undefined
  );

  submitDisabled = true;

  private valueChanges$$: Subscription;

  constructor(private formService: FormService) {}

  ngOnInit() {
    const fieldConfigs: FormFieldConfig[] = [
      {
        name: 'id',
        title: 'ID',
        options: {
          cols: 1,
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
          choices: [
            { value: 1, title: 'Single' },
            { value: 2, title: 'Married' }
          ]
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
      status: 2
    });
  }

  clearForm(): void {
    this.form$.value.control.reset();
  }

  onSubmit(data: object): void {
    alert(JSON.stringify(data));
  }
}
