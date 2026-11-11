import { FormDialogStepConfig } from './form-dialog.interface';
import { resolveFormDialogStepFormConfig } from './form-dialog.utils';

describe('resolveFormDialogStepFormConfig', () => {
  it('should return a static form config as-is', () => {
    const formConfig = {
      formFieldConfigs: [{ name: 'country', title: 'Country' }]
    };
    const step: FormDialogStepConfig = {
      label: 'Country',
      form: formConfig
    };

    const resolvedConfig = resolveFormDialogStepFormConfig(step, {
      data: {},
      stepIndex: 0,
      steps: [step]
    });

    expect(resolvedConfig).toBe(formConfig);
  });

  it('should resolve the next step form from previous step values', () => {
    const step: FormDialogStepConfig = {
      label: 'City',
      form: ({ data }) => ({
        formFieldConfigs: [
          {
            name: 'city',
            title: 'City',
            type: 'select',
            inputs: {
              choices:
                data.country === 'canada'
                  ? [{ value: 'montreal', title: 'Montreal' }]
                  : [{ value: 'boston', title: 'Boston' }]
            }
          }
        ]
      })
    };

    const resolvedConfig = resolveFormDialogStepFormConfig(step, {
      data: { country: 'canada' },
      stepIndex: 1,
      steps: [step]
    });

    expect(resolvedConfig.formFieldConfigs?.[0]).toMatchObject({
      name: 'city',
      inputs: {
        choices: [{ value: 'montreal', title: 'Montreal' }]
      }
    });
  });
});
