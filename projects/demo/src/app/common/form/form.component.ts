import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import {
  Form,
  FormFieldConfig,
  FormService,
  IgoFormFormModule,
  IgoFormGroupModule
} from '@igo2/common';
import { LanguageService } from '@igo2/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    NgIf,
    IgoFormFormModule,
    IgoFormGroupModule,
    MatButtonModule,
    AsyncPipe
  ]
})
export class AppFormComponent implements OnInit, OnDestroy {
  form$ = new BehaviorSubject<Form>(undefined);

  data$ = new BehaviorSubject<{ [key: string]: any }>(undefined);

  submitDisabled = true;

  private valueChanges$$: Subscription;

  constructor(
    private formService: FormService,
    private languageService: LanguageService
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

    const fields = fieldConfigs.map((config) => this.formService.field(config));
    const form = this.formService.form(
      [],
      [this.formService.group({ name: 'info' }, fields)]
    );

    this.valueChanges$$ = form.control.valueChanges.subscribe(() => {
      this.submitDisabled = !form.control.valid;
    });

    this.form$.next(form);
  }

  ngOnDestroy() {
    this.valueChanges$$.unsubscribe();
  }

  fillForm() {
    this.data$.next({
      id: 1,
      name: 'Bob',
      status: 2
    });
  }

  clearForm() {
    this.form$.value.control.reset();
  }

  onSubmit(data: { [key: string]: any }) {
    alert(JSON.stringify(data));
  }
}
