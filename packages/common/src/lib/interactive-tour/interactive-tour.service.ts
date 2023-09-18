import { Injectable } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';

import { ConfigService, MediaService, LanguageService } from '@igo2/core';
import { InteractiveTourLoader } from './interactive-tour.loader';
import {
  InteractiveTourOptions,
  InteractiveTourStep,
  InteractiveTourAction
} from './interactive-tour.interface';

@Injectable({
  providedIn: 'root'
})
export class InteractiveTourService {
  private previousStep: InteractiveTourStep;
  private nextIndex = 1;

  constructor(
    private configService: ConfigService,
    private mediaService: MediaService,
    private languageService: LanguageService,
    private interactiveTourLoader: InteractiveTourLoader,
    private shepherdService: ShepherdService
  ) {
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
      for (const condition of stepConfig?.conditions) {
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
    if (showInMobile === undefined) {
      return true;
    }
    return this.configService.getConfig('interactiveTour.tourInMobile');
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
          if (currentStepElement) {
            const shepherdList = currentStepElement.querySelectorAll(
              '.shepherd-content, .shepherd-text'
            );
            shepherdList.forEach((element) => {
              element.classList.add('mat-typography');
            });
          }
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

  private checkNext(index, tour, service) {
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
        service.checkNext(index, tour, service);
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

  private getShepherdSteps(stepConfig: InteractiveTourOptions) {
    const shepherdSteps = [];

    let i = 0;
    for (const step of stepConfig.steps) {
      shepherdSteps.push({
        attachTo: {
          element: step.element,
          on: step.position || stepConfig.position
        },
        popperOptions: {
          modifiers: [{ name: 'offset', options: { offset: [0, 15] } }]
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
            : i + 1 === stepConfig.steps.length
            ? 'last'
            : stepConfig.steps[i].noBackButton
            ? 'noBackButton'
            : undefined
        ),
        classes: step.class,
        highlightClass: step.highlightClass,
        scrollTo: step.scrollToElement || stepConfig.scrollToElement || true,
        canClickTarget: step.disableInteraction
          ? !step.disableInteraction
          : undefined,
        title: this.languageService.translate.instant(
          step.title || stepConfig.title
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
      });
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
      this.checkNext(index, this.shepherdService.tourObject, this);
    });

    this.shepherdService.start();
  }
}
