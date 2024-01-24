import { Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

import { Form, FormField, FormFieldConfig, FormService } from '@igo2/common';

import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class AppFormComponent implements OnInit, OnDestroy {
  form$: BehaviorSubject<Form> = new BehaviorSubject<Form>(undefined);

  data$: BehaviorSubject<object> = new BehaviorSubject<{ [key: string]: any }>(undefined);

  submitDisabled = true;

  private valueChanges$$: Subscription;

  constructor(
    private formService: FormService
  ) {}

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

    const fields: FormField[] = fieldConfigs.map((config: FormFieldConfig) => this.formService.field(config));
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
