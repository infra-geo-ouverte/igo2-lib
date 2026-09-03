import { JsonPipe } from '@angular/common';
import { Component, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { FormStepperComponent } from '@igo2/common/form';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';
import {
  LOCATION_STEPPER_TEXT,
  buildLocationStepperSteps
} from './location-stepper-demo';

@Component({
  selector: 'app-form-stepper',
  templateUrl: './form-stepper.component.html',
  styleUrls: ['./form-stepper.component.scss'],
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    FormStepperComponent,
    MatButtonModule,
    JsonPipe
  ]
})
export class AppFormStepperComponent {
  readonly stepper = viewChild(FormStepperComponent);

  readonly steps = buildLocationStepperSteps();

  readonly data = signal<Record<string, unknown>>({});

  readonly submittedData = signal<Record<string, unknown> | undefined>(
    undefined
  );

  readonly text = LOCATION_STEPPER_TEXT;

  onChange(data: Record<string, unknown>): void {
    this.data.set(data);
  }

  onCompleted(data: Record<string, unknown>): void {
    this.data.set(data);
    this.submittedData.set(data);
  }

  restart(): void {
    this.submittedData.set(undefined);
    this.stepper()?.reset();
    this.data.set({});
  }
}
