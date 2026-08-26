import { Validators } from '@angular/forms';

import { FormStepperStepConfig } from '@igo2/common/form';

export const LOCATION_STEPPER_TEXT = {
  title: 'Multi-step location form',
  nextButtonText: 'Continue',
  previousButtonText: 'Back',
  processButtonText: 'Finish'
} as const;

export function buildLocationStepperSteps(): FormStepperStepConfig[] {
  const cityChoicesByCountry: Record<
    'canada' | 'usa',
    { value: string; title: string }[]
  > = {
    canada: [
      { value: 'montreal', title: 'Montreal' },
      { value: 'quebec', title: 'Quebec City' }
    ],
    usa: [
      { value: 'boston', title: 'Boston' },
      { value: 'seattle', title: 'Seattle' }
    ]
  };

  const districtChoicesByCity: Record<
    'montreal' | 'quebec' | 'boston' | 'seattle',
    { value: string; title: string }[]
  > = {
    montreal: [
      { value: 'plateau', title: 'Plateau-Mont-Royal' },
      { value: 'sud-ouest', title: 'Le Sud-Ouest' }
    ],
    quebec: [
      { value: 'vieux-quebec', title: 'Vieux-Quebec' },
      { value: 'sainte-foy', title: 'Sainte-Foy' }
    ],
    boston: [
      { value: 'back-bay', title: 'Back Bay' },
      { value: 'seaport', title: 'Seaport' }
    ],
    seattle: [
      { value: 'ballard', title: 'Ballard' },
      { value: 'fremont', title: 'Fremont' }
    ]
  };

  const cityTitlesByValue = Object.fromEntries(
    Object.values(cityChoicesByCountry)
      .flat()
      .map((choice) => [choice.value, choice.title])
  ) as Record<string, string>;

  return [
    {
      label: 'Country',
      title: 'Choose a country',
      form: {
        formFieldConfigs: [
          {
            name: 'country',
            title: 'Country',
            type: 'select',
            options: {
              cols: 2,
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
    },
    {
      label: 'City',
      title: 'Choose a city and postal format',
      notice:
        'The city choices and postal label update from your country selection.',
      form: ({ data }) => {
        const country: keyof typeof cityChoicesByCountry =
          data.country === 'usa' ? 'usa' : 'canada';

        return {
          formFieldConfigs: [
            {
              name: 'city',
              title: 'City',
              type: 'select',
              options: {
                cols: 2,
                validator: Validators.required
              },
              inputs: {
                choices: cityChoicesByCountry[country]
              }
            },
            {
              name: 'postalCode',
              title: country === 'canada' ? 'Postal code' : 'ZIP code',
              options: {
                cols: 2,
                validator: Validators.required
              }
            }
          ]
        };
      }
    },
    {
      label: 'Details',
      title: 'Finish the location',
      notice:
        'District suggestions update from the city selected in the previous step.',
      form: ({ data }) => {
        const city = typeof data.city === 'string' ? data.city : undefined;
        const cityTitle = city ? (cityTitlesByValue[city] ?? city) : undefined;
        const districtChoices =
          city && city in districtChoicesByCity
            ? districtChoicesByCity[city as keyof typeof districtChoicesByCity]
            : [];

        return {
          formFieldConfigs: [
            districtChoices.length
              ? {
                  name: 'district',
                  title: 'District',
                  type: 'select',
                  options: {
                    cols: 2,
                    validator: Validators.required
                  },
                  inputs: {
                    choices: districtChoices
                  }
                }
              : {
                  name: 'district',
                  title: 'District / area',
                  options: {
                    cols: 2,
                    validator: Validators.required
                  }
                },
            {
              name: 'notes',
              title: cityTitle ? `Notes for ${cityTitle}` : 'Notes',
              options: {
                cols: 2
              }
            }
          ]
        };
      }
    }
  ];
}
