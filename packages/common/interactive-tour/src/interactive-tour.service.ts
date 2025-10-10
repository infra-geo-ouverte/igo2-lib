import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { MediaService } from '@igo2/core/media';

import { autoPlacement, offset } from '@floating-ui/dom';
import { ShepherdService } from 'angular-shepherd';
import { StepOptions, Tour } from 'shepherd.js';

import {
  InteractiveTourAction,
  InteractiveTourOptions,
  InteractiveTourStep
} from './interactive-tour.interface';
import { InteractiveTourLoader } from './interactive-tour.loader';

interface IIndexTour {
  index: number;
  tour: Tour;
}

@Injectable({
  providedIn: 'root'
})
export class InteractiveTourService {
  private configService = inject(ConfigService);
  private mediaService = inject(MediaService);
  private languageService = inject(LanguageService);
  private interactiveTourLoader = inject(InteractiveTourLoader);
  private shepherdService = inject(ShepherdService);

  private previousStep: InteractiveTourStep;

  constructor() {
    if (this.isAppHaveTour()) {
      this.interactiveTourLoader.loadConfigTour();
    }
  }

  public isAppHaveTour() {
    const haveTour = this.configService.getConfig(
      'interactiveTour.activateInteractiveTour'
    );
    if (haveTour === undefined) {
      return true;
    } else {
      return haveTour;
    }
  }

  public isToolHaveTourConfig(toolName: string): boolean {
    const checkTourActiveOptions =
      this.interactiveTourLoader.getTourOptionData(toolName);
    if (checkTourActiveOptions === undefined) {
      return false;
    } else {
      return true;
    }
  }

  public disabledTourButton(toolName: string): boolean {
    const stepConfig: InteractiveTourOptions =
      this.interactiveTourLoader.getTourOptionData(toolName);

    if (stepConfig?.conditions) {
      for (const condition of stepConfig.conditions) {
        if (document.querySelector(condition) === null) {
          return true;
        }
      }
    }
    return false;
  }

  public isMobile(): boolean {
    return this.mediaService.isMobile();
  }

  public isTourDisplayInMobile(): boolean {
    const showInMobile = this.configService.getConfig(
      'interactiveTour.tourInMobile'
    );

    return showInMobile === undefined ? true : showInMobile;
  }

  private getButtons(buttonKind?: 'first' | 'last' | 'noBackButton') {
    if (buttonKind === 'noBackButton') {
      return [
        {
          classes: 'shepherd-button-primary',
          text: this.languageService.translate.instant(
            'igo.common.interactiveTour.nextButton'
          ),
          type: 'next'
        }
      ];
    }
    if (buttonKind === 'first') {
      return [
        {
          classes: 'shepherd-button-secondary',
          text: this.languageService.translate.instant(
            'igo.common.interactiveTour.exitButton'
          ),
          type: 'cancel'
        },
        {
          classes: 'shepherd-button-primary',
          text: this.languageService.translate.instant(
            'igo.common.interactiveTour.nextButton'
          ),
          type: 'next'
        }
      ];
    }

    if (buttonKind === 'last') {
      return [
        {
          classes: 'shepherd-button-secondary',
          text: this.languageService.translate.instant(
            'igo.common.interactiveTour.backButton'
          ),
          type: 'back'
        },
        {
          classes: 'shepherd-button-primary',
          text: this.languageService.translate.instant(
            'igo.common.interactiveTour.exitButton'
          ),
          type: 'cancel'
        }
      ];
    }

    return [
      {
        classes: 'shepherd-button-secondary',
        text: this.languageService.translate.instant(
          'igo.common.interactiveTour.backButton'
        ),
        type: 'back'
      },
      {
        classes: 'shepherd-button-primary',
        text: this.languageService.translate.instant(
          'igo.common.interactiveTour.nextButton'
        ),
        type: 'next'
      }
    ];
  }

  private getAction(actionName: string) {
    const action = {
      click: 'click'
    };
    return action[actionName.toLowerCase()];
  }

  private addProgress() {
    const self = this as any;
    let nbTry = 0;
    const maxTry = 21;
    const checkExist = setInterval(() => {
      if (self.getCurrentStep()) {
        if (
          self.getCurrentStep().options.attachTo.element &&
          !document.querySelector(
            self.getCurrentStep().options.attachTo.element
          )
        ) {
          self.cancel();
          clearInterval(checkExist);
          return;
        } else {
          const currentStepElement = self.getCurrentStep().getElement();
          const header = currentStepElement
            ? currentStepElement.querySelector('.shepherd-header')
            : undefined;

          nbTry++;
          if (header || nbTry > maxTry) {
            clearInterval(checkExist);
          }

          if (header) {
            const stepsArray = self.steps;
            const progress = document.createElement('span');
            progress.className = 'shepherd-progress';
            progress.innerText = `${
              stepsArray.indexOf(self.getCurrentStep()) + 1
            }/${stepsArray.length}`;
            header.insertBefore(
              progress,
              currentStepElement.querySelector('.shepherd-cancel-icon')
            );
          }
        }
      }
    }, 100);
  }

  private checkNext(index: IIndexTour, tour) {
    if (tour.getCurrentStep()) {
      if (
        tour.getCurrentStep().options.attachTo.element &&
        document.querySelector(tour.getCurrentStep().options.attachTo.element)
      ) {
        tour.complete();
        return;
      }

      if (index.index === tour.steps.length - 1) {
        tour.complete();
        return;
      }

      tour.steps.splice(index.index, 1);
      const nextStep = tour.steps[index.index];
      if (
        nextStep.options.attachTo.element &&
        !document.querySelector(nextStep.options.attachTo.element)
      ) {
        index.index = index.index + 1;
        this.checkNext(index, tour);
      } else {
        tour._setupModal();
        tour.show(nextStep.id);
      }
    }
  }

  private executeAction(
    step: InteractiveTourStep,
    actionConfig: InteractiveTourAction
  ) {
    if (!actionConfig) {
      return;
    }

    if (
      actionConfig.condition &&
      ((actionConfig.condition.charAt(0) === '!' &&
        document.querySelector(actionConfig.condition.slice(1))) ||
        (actionConfig.condition.charAt(0) !== '!' &&
          !document.querySelector(actionConfig.condition)))
    ) {
      return;
    }

    const element: HTMLElement = document.querySelector(
      actionConfig.element || step.element
    ) as HTMLElement;
    const action = this.getAction(actionConfig.action);
    if (element && action) {
      element[action]();
    }
  }

  private executeActionPromise(
    step: InteractiveTourStep,
    actionConfig: InteractiveTourAction
  ) {
    return new Promise<void>((resolve) => {
      this.executeAction(step, actionConfig);
      if (!actionConfig || !actionConfig.waitFor) {
        resolve();
        return;
      }
      let nbTry = 0;
      const maxTry = actionConfig.maxWait ? actionConfig.maxWait / 100 : 20;
      const checkExist = setInterval(() => {
        nbTry++;
        if (nbTry > maxTry || document.querySelector(actionConfig.waitFor)) {
          clearInterval(checkExist);
          resolve();
        }
      }, 100);
    });
  }

  private getShepherdSteps(tourConfig: InteractiveTourOptions) {
    const shepherdSteps: StepOptions[] = [];

    let i = 0;
    for (const step of tourConfig.steps) {
      const position = step.position ?? tourConfig.position;
      shepherdSteps.push({
        attachTo: {
          element: step.element,
          on: position as any // PopperPlacement
        },
        floatingUIOptions: {
          middleware: [
            position === 'auto' && autoPlacement(),
            offset({ mainAxis: 15 })
          ].filter(Boolean)
        },
        beforeShowPromise: () => {
          return Promise.all([
            this.executeActionPromise(
              this.previousStep,
              this.previousStep ? this.previousStep.beforeChange : undefined
            ),
            this.executeActionPromise(step, step.beforeShow)
          ]);
        },
        buttons: this.getButtons(
          i === 0
            ? 'first'
            : i + 1 === tourConfig.steps.length
              ? 'last'
              : tourConfig.steps[i].noBackButton
                ? 'noBackButton'
                : undefined
        ),
        classes: step.class,
        highlightClass: step.highlightClass,
        scrollTo: step.scrollToElement || tourConfig.scrollToElement || true,
        canClickTarget: step.disableInteraction
          ? !step.disableInteraction
          : undefined,
        title: this.languageService.translate.instant(
          step.title || tourConfig.title
        ),
        text: [this.languageService.translate.instant(step.text)],
        when: {
          show: () => {
            this.executeAction(step, step.onShow);
          },
          hide: () => {
            this.previousStep = step;
            this.executeAction(step, step.onHide);
          }
        }
      } satisfies StepOptions);
      i++;
    }

    return shepherdSteps;
  }

  public startTour(toolName: string) {
    const stepConfig: InteractiveTourOptions =
      this.interactiveTourLoader.getTourOptionData(toolName);

    this.shepherdService.defaultStepOptions = {
      classes: stepConfig.class,
      highlightClass: stepConfig.highlightClass,
      canClickTarget: stepConfig.disableInteraction
        ? !stepConfig.disableInteraction
        : true,
      cancelIcon: {
        enabled: true
      }
    };

    const shepherdSteps = this.getShepherdSteps(stepConfig);

    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(shepherdSteps);

    this.shepherdService.tourObject.on('show', this.addProgress);
    this.shepherdService.tourObject.on('cancel', (index) => {
      this.checkNext(index, this.shepherdService.tourObject);
    });

    this.shepherdService.start();
  }
}
