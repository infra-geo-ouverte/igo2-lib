import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import {
  Choice,
  ConfirmDialogService,
  FormDialogService,
  FormFieldConfig,
  FormGroupsConfig,
  IgoConfirmDialogModule,
  IgoFormDialogModule,
  IgoJsonDialogModule,
  IgoSelectValueDialogModule,
  JsonDialogService,
  SelectValueDialogService
} from '@igo2/common';

import { SelectValueDialogType } from 'packages/common/src/lib/select-value-dialog/select-value-dialog.enums';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    IgoConfirmDialogModule,
    IgoSelectValueDialogModule,
    IgoFormDialogModule,
    IgoJsonDialogModule,
    MatButtonModule,
    MatDividerModule
  ]
})
export class AppDialogComponent {
  constructor(
    private confirmDialogService: ConfirmDialogService,
    private selectValueDialogService: SelectValueDialogService,
    private jsonDialogService: JsonDialogService,
    private formDialogService: FormDialogService
  ) {}

  confirm() {
    this.confirmDialogService
      .open('Do you want to continue?')
      .subscribe((r) => {
        alert(`Your choice is: ${r}`);
      });
  }
  yesno() {
    this.confirmDialogService
      .open('Is the sky blue today? ', { modeYesNo: true })
      .subscribe((r) => {
        alert(`Your choice is: ${r}`);
      });
  }

  private select(type: SelectValueDialogType) {
    const choices: Choice[] = [
      { value: '1', title: 'Chocolate' },
      { value: '2', title: 'Candy' },
      { value: 3, title: 'Cake' }
    ];

    this.selectValueDialogService.open(choices, { type }).subscribe((r) => {
      if (r?.choices) {
        if (r.choices.length > 1) {
          alert(`Your choice(s) are: ${r.choices}`);
        } else {
          alert(`Your choice is: ${r.choices}`);
        }
      }
    });
  }

  check() {
    this.select(SelectValueDialogType.Checkbox);
  }
  radio() {
    this.select(SelectValueDialogType.Radio);
  }

  json() {
    this.jsonDialogService.open(
      'A JSON viewer',
      {
        isbn: '123-456-222',
        author: {
          lastname: 'Doe',
          firstname: 'Jane'
        },
        editor: {
          lastname: 'Smith',
          firstname: 'Jane'
        },
        title: 'The Ultimate Database Study Guide',
        category: ['Non-Fiction', 'Technology']
      },
      ['category']
    );
  }
  form() {
    const formFieldConfigs: FormFieldConfig[] = [
      {
        name: 'country',
        title: 'Country',
        options: {
          cols: 1
        }
      }
    ];

    const formFieldConfigs1: FormFieldConfig[] = [
      {
        name: 'city',
        title: 'City',
        options: {
          cols: 1
        }
      }
    ];
    const formFieldConfigs2: FormFieldConfig[] = [
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

    const formGroupsConfigs: FormGroupsConfig[] = [
      { name: 'country', formFieldConfigs: formFieldConfigs1 },
      { name: 'city', formFieldConfigs: formFieldConfigs2 }
    ];

    this.formDialogService
      .open({ formFieldConfigs, formGroupsConfigs }, { minWidth: '50vh' })
      .subscribe((data) => {
        if (data) {
          alert(JSON.stringify(data));
        }
      });
  }

  email() {
    const formFieldConfigs: FormFieldConfig[] = [
      {
        name: 'email',
        title: 'Email',
        options: {
          cols: 2,
          validator: Validators.compose([Validators.required, Validators.email])
        }
      },
      {
        name: 'password',
        title: 'Password',
        options: {
          cols: 2,
          validator: Validators.required
        },
        inputs: {
          isPassword: true
        }
      }
    ];

    this.formDialogService.open({ formFieldConfigs }).subscribe((data) => {
      if (data) {
        data.password = '°°°°°°°°°°';
        alert(JSON.stringify(data));
      }
    });
  }
}
