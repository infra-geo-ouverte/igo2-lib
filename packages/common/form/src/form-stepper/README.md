# Form Stepper

`FormStepperComponent` is driven by `FormStepperStepConfig`.

The main thing to configure is not the component integration, but the `steps` array itself. Each item defines:

- what the step is called
- what the active step header displays
- optional contextual help
- which form fields are rendered
- how previous step data changes the next step

Use it when you need:

- a form split across multiple steps
- step-local validation before moving forward
- data from a previous step to change the next step

## Core Type

The central contract is `FormStepperStepConfig`:

```ts
export interface FormStepperStepConfig {
  label: string;
  title?: string;
  notice?: string;
  form: FormStepperFormConfig | FormStepperStepFormConfigResolver;
}
```

## Step Anatomy

Each property has a distinct role:

- `label`: shown in the Material step header and in the active-step badge
- `title`: optional heading shown above the rendered form for the active step
- `notice`: optional note shown under the form for the active step
- `form`: the actual form definition for that step, either static or computed dynamically

Minimal example:

```ts
import { Validators } from '@angular/forms';

import { FormStepperStepConfig } from '@igo2/common/form';

export const steps: FormStepperStepConfig[] = [
  {
    label: 'Account',
    title: 'Create your account',
    notice: 'All fields in this step are required.',
    form: {
      formFieldConfigs: [
        {
          name: 'email',
          title: 'Email',
          options: {
            validator: Validators.required
          }
        }
      ]
    }
  }
];
```

## Supporting Types

`form` relies on these helper types:

```ts
export interface FormStepperFormConfig {
  formFieldConfigs?: FormFieldConfig[];
  formGroupsConfigs?: FormGroupsConfig[];
}

export interface FormStepperStepContext {
  data: Readonly<Record<string, unknown>>;
  stepIndex: number;
  steps: readonly FormStepperStepConfig[];
}

export type FormStepperStepFormConfigResolver = (context: FormStepperStepContext) => FormStepperFormConfig;

export interface FormStepperStepConfig {
  label: string;
  title?: string;
  notice?: string;
  form: FormStepperFormConfig | FormStepperStepFormConfigResolver;
}

export interface FormStepperConfig {
  steps: FormStepperStepConfig[];
}
```

## Static Form Step

A static step uses a plain `FormStepperFormConfig` object.

Use this when the fields do not depend on previous answers.

Example:

```ts
import { Validators } from '@angular/forms';

import { FormStepperStepConfig } from '@igo2/common/form';

export const steps: FormStepperStepConfig[] = [
  {
    label: 'Location',
    title: 'Choose a country',
    form: {
      formFieldConfigs: [
        {
          name: 'country',
          title: 'Country',
          type: 'select',
          options: {
            validator: Validators.required
          },
          inputs: {
            choices: [
              { value: 'canada', title: 'Canada' },
              { value: 'usa', title: 'United States' }
            ]
          }
        }
      ]
    }
  }
];
```

## Dynamic Form Step

When `form` is a function, the step becomes data-driven.

The function receives a `FormStepperStepContext`:

- `data`: merged values from all completed previous steps, plus `initialData`
- `stepIndex`: current zero-based step index
- `steps`: full step definition array

Use this to:

- change field labels
- change available choices
- show a different field structure
- add conditional fields or groups

Example:

```ts
const cityStep: FormStepperStepConfig = {
  label: 'City',
  title: 'Choose a city',
  notice: 'Choices depend on the selected country.',
  form: ({ data }) => {
    const country = data['country'] === 'usa' ? 'usa' : 'canada';

    return {
      formFieldConfigs: [
        {
          name: 'city',
          title: 'City',
          type: 'select',
          inputs: {
            choices:
              country === 'usa'
                ? [
                    { value: 'boston', title: 'Boston' },
                    { value: 'seattle', title: 'Seattle' }
                  ]
                : [
                    { value: 'montreal', title: 'Montreal' },
                    { value: 'quebec', title: 'Quebec City' }
                  ]
          }
        }
      ]
    };
  }
};
```

## How Step Data Flows

The stepper aggregates data progressively.

Rules:

- a step only advances when the active form is valid
- successful submit stores that step result
- `dataChange` emits the aggregate result after each valid step change
- `completed` emits the aggregate result after the last step
- going back keeps previous data available
- changing an earlier completed step clears cached results from later steps

This matters when writing a dynamic `form` resolver, because `data` only contains confirmed values from prior completed steps.

## Recommended Configuration Pattern

In practice, the cleanest setup is:

- define a `FormStepperStepConfig[]` in its own file
- keep each `label`, `title`, and `notice` translation-friendly
- use static `form` objects for simple steps
- use resolver functions only when a step depends on previous data
- keep resolver functions pure and deterministic

Example shape:

```ts
export function buildExampleSteps(): FormStepperStepConfig[] {
  return [
    {
      label: 'Step 1',
      title: 'First step',
      form: {
        formFieldConfigs: [
          {
            name: 'category',
            title: 'Category'
          }
        ]
      }
    },
    {
      label: 'Step 2',
      title: 'Second step',
      form: ({ data }) => ({
        formFieldConfigs: [
          {
            name: 'details',
            title: data['category'] === 'advanced' ? 'Advanced details' : 'Details'
          }
        ]
      })
    }
  ];
}
```

## Integration Summary

Once `FormStepperStepConfig[]` is defined, integration is straightforward.

Standalone component:

```ts
import { Component, signal } from '@angular/core';

import { FormStepperComponent } from '@igo2/common/form';

@Component({
  selector: 'app-example',
  imports: [FormStepperComponent],
  template: ` <igo-form-stepper [steps]="steps" [initialData]="initialData()" [notice]="notice" [nextButtonText]="'igo.common.formStepper.nextButtonText'" [previousButtonText]="'igo.common.formStepper.previousButtonText'" [processButtonText]="'igo.common.formDialog.processButtonText'" [cancelButtonText]="'igo.common.formDialog.cancelButtonText'" [showCancelButton]="false" (dataChange)="onDataChange($event)" (completed)="onCompleted($event)" /> `
})
export class ExampleComponent {
  readonly steps = steps;
  readonly initialData = signal<Record<string, unknown>>({});
  readonly notice = 'igo.common.example.stepper.notice';

  onDataChange(data: Record<string, unknown>): void {
    console.log('Draft data', data);
  }

  onCompleted(data: Record<string, unknown>): void {
    console.log('Final data', data);
  }
}
```

Dialog:

```ts
this.formDialogService.openStepper(
  { steps },
  {
    title: 'igo.common.formDialog.title'
  }
);
```

## Component Inputs

- `steps`: required array of `FormStepperStepConfig`
- `initialData`: initial object merged before completed step data
- `notice`: fallback notice used when the active step does not define one
- `nextButtonText`: translation key or text for the next button
- `previousButtonText`: translation key or text for the previous button
- `processButtonText`: translation key or text for the final submit button
- `cancelButtonText`: translation key or text for the cancel button
- `showCancelButton`: hides or shows the cancel button

## Component Outputs

- `dataChange`: emits the aggregate draft data after each valid navigation change
- `completed`: emits the final aggregate data on the last step submit
- `cancelled`: emits when the cancel button is clicked

## Translation Notes

The component translates:

- step labels and titles in the template
- button labels when you pass translation keys
- the step counter through `LanguageService`

Prefer translation keys over hardcoded text for any user-facing label.
