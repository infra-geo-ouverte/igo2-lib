import {
  Component,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';

import { IgoCustomHtmlModule } from '@igo2/common/custom-html';
import { IgoLanguageModule, labelAttribute } from '@igo2/core/language';

import { IgoFormModule } from '../form.module';
import { Form, FormService } from '../shared';
import { buildFormFromConfig, markFormAsTouched } from '../shared/form.utils';
import {
  FormStepperLabels,
  FormStepperStepConfig
} from './form-stepper.interface';
import {
  DEFAULT_FORM_STEPPER_LABELS,
  resolveFormStepperStepFormConfig
} from './form-stepper.utils';

@Component({
  selector: 'igo-form-stepper',
  templateUrl: './form-stepper.component.html',
  styleUrls: ['./form-stepper.component.scss'],
  imports: [
    MatStepperModule,
    IgoFormModule,
    MatButtonModule,
    IgoCustomHtmlModule,
    IgoLanguageModule
  ]
})
export class FormStepperComponent {
  private readonly formService = inject(FormService);

  readonly steps = input.required<FormStepperStepConfig[]>();

  readonly initialData = input<Record<string, unknown>>({});

  readonly notice = input<string | undefined>();

  readonly labels = input<
    FormStepperLabels,
    Partial<FormStepperLabels> | undefined
  >(DEFAULT_FORM_STEPPER_LABELS, {
    transform: (value) => labelAttribute(value, DEFAULT_FORM_STEPPER_LABELS)
  });

  readonly showCancelButton = input(true);

  readonly completed = output<Record<string, unknown>>();

  readonly cancelled = output<void>();

  readonly dataChange = output<Record<string, unknown>>();

  readonly stepIndex = signal(0);

  private readonly stepResults = signal<
    Record<number, Record<string, unknown>>
  >({});

  readonly activeStep = computed<FormStepperStepConfig>(() => {
    const steps = this.steps();

    if (!steps.length) {
      throw new Error('Form stepper requires at least one step.');
    }

    return steps[this.stepIndex()];
  });

  readonly activeContextData = computed(() =>
    this.buildAggregateData(this.stepIndex() - 1)
  );

  readonly activeFormData = computed(() =>
    this.buildAggregateData(this.stepIndex())
  );

  readonly activeForm = computed<Form>(() =>
    buildFormFromConfig(
      this.formService,
      resolveFormStepperStepFormConfig(this.activeStep(), {
        data: this.activeContextData(),
        stepIndex: this.stepIndex(),
        steps: this.steps()
      })
    )
  );

  readonly activeNotice = computed(
    () => this.activeStep().notice ?? this.notice()
  );

  readonly stepCount = computed(() => this.steps().length);

  readonly stepNumber = computed(() => this.stepIndex() + 1);

  readonly resolvedLabels = computed<FormStepperLabels>(
    () =>
      labelAttribute(
        this.labels(),
        DEFAULT_FORM_STEPPER_LABELS
      ) as FormStepperLabels
  );

  readonly stepCounterLabel = computed(() =>
    this.resolvedLabels()
      .stepCounter.replace('{{current}}', String(this.stepNumber()))
      .replace('{{total}}', String(this.stepCount()))
  );

  readonly progressWidth = computed(
    () => `${(this.stepNumber() / this.stepCount()) * 100}%`
  );

  readonly maxNavigableStepIndex = computed(() => {
    const completedStepIndexes = Object.keys(this.stepResults())
      .map((index) => Number(index))
      .filter((index) => !Number.isNaN(index));

    if (!completedStepIndexes.length) {
      return 0;
    }

    return Math.min(
      Math.max(...completedStepIndexes) + 1,
      this.steps().length - 1
    );
  });

  readonly isLastStep = computed(
    () => this.stepIndex() === this.steps().length - 1
  );

  onSubmitStep(stepData: Record<string, unknown>): void {
    const form = this.activeForm();

    if (!form.control.valid) {
      markFormAsTouched(form);
      return;
    }

    const currentStepIndex = this.stepIndex();
    const nextStepResults = {
      ...this.stepResults(),
      [currentStepIndex]: stepData
    };

    Object.keys(nextStepResults)
      .map((index) => Number(index))
      .filter((index) => index > currentStepIndex)
      .forEach((index) => {
        delete nextStepResults[index];
      });

    this.stepResults.set(nextStepResults);

    const aggregateData = this.buildAggregateDataFrom(
      nextStepResults,
      currentStepIndex
    );

    this.dataChange.emit(aggregateData);

    if (this.isLastStep()) {
      this.completed.emit(aggregateData);
      return;
    }

    queueMicrotask(() => {
      this.stepIndex.set(currentStepIndex + 1);
    });
  }

  previous(): void {
    if (this.stepIndex() === 0) {
      return;
    }

    this.stepIndex.update((index) => index - 1);
    this.dataChange.emit(this.activeFormData());
  }

  cancel(): void {
    this.cancelled.emit();
  }

  reset(): void {
    this.stepResults.set({});
    this.stepIndex.set(0);
    this.dataChange.emit({ ...this.initialData() });
  }

  onSelectedIndexChange(index: number): void {
    if (index <= this.maxNavigableStepIndex()) {
      this.stepIndex.set(index);
      this.dataChange.emit(this.activeFormData());
      return;
    }

    queueMicrotask(() => {
      this.stepIndex.set(this.stepIndex());
    });
  }

  isCompletedStep(index: number): boolean {
    return this.stepResults()[index] !== undefined;
  }

  isEditableStep(index: number): boolean {
    return index <= this.maxNavigableStepIndex();
  }

  private buildAggregateData(lastStepIndex: number): Record<string, unknown> {
    return this.buildAggregateDataFrom(this.stepResults(), lastStepIndex);
  }

  private buildAggregateDataFrom(
    stepResults: Record<number, Record<string, unknown>>,
    lastStepIndex: number
  ): Record<string, unknown> {
    const aggregateData: Record<string, unknown> = { ...this.initialData() };

    for (let index = 0; index <= lastStepIndex; index += 1) {
      Object.assign(aggregateData, stepResults[index] ?? {});
    }

    return aggregateData;
  }
}
