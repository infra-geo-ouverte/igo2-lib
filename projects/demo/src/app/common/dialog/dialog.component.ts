import { Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import {
  ConfirmDialogService,
  IgoConfirmDialogModule
} from '@igo2/common/confirm-dialog';
import {
  FormDialogService,
  FormFieldConfig,
  FormGroupsConfig,
  IgoFormDialogModule
} from '@igo2/common/form';
import {
  IgoJsonDialogModule,
  JsonDialogService
} from '@igo2/common/json-dialog';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';
import {
  LOCATION_STEPPER_TEXT,
  buildLocationStepperSteps
} from '../form-stepper/location-stepper-demo';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    IgoConfirmDialogModule,
    IgoFormDialogModule,
    IgoJsonDialogModule,
    MatButtonModule,
    MatDividerModule
  ]
})
export class AppDialogComponent {
  private confirmDialogService = inject(ConfirmDialogService);
  private jsonDialogService = inject(JsonDialogService);
  private formDialogService = inject(FormDialogService);

  confirm(): void {
    this.confirmDialogService
      .open('Do you want to continue?')
      .subscribe((r) => {
        alert(`Your choice is: ${r}`);
      });
  }
  yesno(): void {
    this.confirmDialogService
      .open('Is the sky blue today? ', { modeYesNo: true })
      .subscribe((r) => {
        alert(`Your choice is: ${r}`);
      });
  }

  json(): void {
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
  form(): void {
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
      },
      {
        name: 'interests',
        title: 'Interests',
        type: 'checkbox',
        options: {
          cols: 2,
          validator: Validators.required
        },
        inputs: {
          choices: [
            { value: 'sports', title: 'Sports' },
            { value: 'music', title: 'Music' },
            { value: 'travel', title: 'Travel' }
          ]
        }
      },
      {
        name: 'contactMode',
        title: 'Preferred Contact Mode',
        type: 'radiobutton',
        options: {
          cols: 2,
          validator: Validators.required
        },
        inputs: {
          choices: [
            { value: 'email', title: 'Email' },
            { value: 'phone', title: 'Phone' },
            { value: 'sms', title: 'SMS' }
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
      .subscribe((data?: Record<string, unknown>) => {
        if (data) {
          alert(JSON.stringify(data));
        }
      });
  }

  email(): void {
    const formFieldConfigs: FormFieldConfig[] = [
      {
        name: 'email',
        title: 'Email',
        options: {
          cols: 2,
          validator:
            Validators.compose([Validators.required, Validators.email]) ??
            undefined
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

    this.formDialogService
      .open({ formFieldConfigs })
      .subscribe((data?: Record<string, unknown>) => {
        if (!data) {
          return;
        }

        alert(
          JSON.stringify({
            ...data,
            password: '°°°°°°°°°°'
          })
        );
      });
  }

  stepper(): void {
    this.formDialogService
      .openStepper(
        { steps: buildLocationStepperSteps() },
        {
          title: LOCATION_STEPPER_TEXT.title,
          nextButtonText: LOCATION_STEPPER_TEXT.nextButtonText,
          previousButtonText: LOCATION_STEPPER_TEXT.previousButtonText,
          processButtonText: LOCATION_STEPPER_TEXT.processButtonText
        }
      )
      .subscribe((data?: Record<string, unknown>) => {
        if (data) {
          alert(JSON.stringify(data, null, 2));
        }
      });
  }
}
