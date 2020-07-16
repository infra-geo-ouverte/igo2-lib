import { Injectable } from '@angular/core';
import { ConfigService, MediaService, LanguageService } from '@igo2/core';
import { introJs } from 'intro.js';
import { InteractiveTourLoader } from './interactive-tour.loader';
import { InteractiveTourOptions, InteractiveTourStep } from './interactive-tour.interface';

@Injectable({
  providedIn: 'root'
})
export class InteractiveTourService {
  public introJS = introJs();

  constructor(
    private configService: ConfigService,
    private mediaService: MediaService,
    private languageService: LanguageService,
    private interactiveTourLoader: InteractiveTourLoader
    ) {}

  public isToolHaveTourConfig(toolName: string): boolean {
    const checkTourActiveOptions = this.interactiveTourLoader.getTourOptionData(toolName);
    if (checkTourActiveOptions === undefined) {
      return false;
    } else {
      return true;
    }
  }

  public isMobile(): boolean {
    const media = this.mediaService.getMedia();
    if (media === 'mobile') {
      return true;
    } else {
      return false;
    }
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

  private isInEnglish(): boolean {
    const lang = this.languageService.getLanguage();
    if (lang === 'en' || lang === 'EN') {
      return true;
    } else {
      return false;
    }
  }

  public startTour(toolName, menuIsOpen?: string) {

    this.introJS.oncomplete(() => {
    });

    this.introJS.onexit(() => {
    });

    this.introJS.onbeforechange(targetElement => {
      const tourNo: number = this.introJS._currentStep;

      // When the element doesn't exist when you start tour
      // we need to set it when it exist
      if (targetElement.className.indexOf('introjsFloatingElement') !== -1) {
        const currentStepConfig: InteractiveTourStep = this.interactiveTourLoader.getTourOptionData(toolName).steps[tourNo];
        const currentElemConfig = currentStepConfig.element;
        const currentPositionElemConfig = currentStepConfig.position;
        // maybe more properties introJS need to be set here...

        let unElem: HTMLElement;
        unElem = document.getElementsByTagName(
          currentElemConfig
        )[0] as HTMLElement;

        if (!unElem) {
          unElem = document.getElementsByClassName(
            currentElemConfig
          )[0] as HTMLElement;
          if (!unElem) {
            unElem = document.querySelector(currentElemConfig);
            if (!unElem) {
              unElem = document.getElementById(
                currentElemConfig
              ) as HTMLElement;
              if (!unElem) {
              } else {
                this.introJS._introItems[tourNo].element = unElem;
                this.introJS._introItems[
                  tourNo
                ].position = currentPositionElemConfig;
              }
            } else {
              this.introJS._introItems[tourNo].element = unElem;
              this.introJS._introItems[
                tourNo
              ].position = currentPositionElemConfig;
            }
          } else {
            this.introJS._introItems[tourNo].element = unElem;
            this.introJS._introItems[
              tourNo
            ].position = currentPositionElemConfig;
          }
        } else {
          this.introJS._introItems[tourNo].element = unElem;
          this.introJS._introItems[tourNo].position = currentPositionElemConfig;
        }
      }
    });

    this.introJS.onchange(targetElement => {
      const tourNo = this.introJS._currentStep;
      if (tourNo) {
        // problem with prev Button... if the user back on tour, another click is made and some time that not what you want
        // no solution found but disable prevButton on tour...
        const actionToMake = this.introJS._introItems[tourNo].action;

        if (actionToMake) {
          let element: HTMLElement;

          if (actionToMake === 'openMenu') {
            // back to initial menu
            const elemHomeBut: HTMLElement = document.querySelector(
              '#homeButton'
            ) as HTMLElement;
            if (elemHomeBut) {
              elemHomeBut.click();
            }
            if (menuIsOpen === 'true') {
              return;
            }
            menuIsOpen = 'true';
            const elemMenuBut: HTMLElement = document.querySelector(
              '#menu-button'
            ) as HTMLElement;
            elemMenuBut.click();
          }

          if (actionToMake === 'closeMenu') {
            // back to initial menu
            const elemHomeBut: HTMLElement = document.querySelector(
              '#homeButton'
            ) as HTMLElement;
            if (elemHomeBut) {
              elemHomeBut.click();
            }
            if (menuIsOpen === 'true') {
              menuIsOpen = 'false';
              const elemMenuBut: HTMLElement = document.querySelector(
              '#menu-button'
            ) as HTMLElement;
              elemMenuBut.click();
            } else {
              return;
            }

          } else if (actionToMake === 'clickOnElem') {
            targetElement.click();
          } else if (actionToMake.substring(0, 11) === 'clickOnTool') {
            const toolIndex = actionToMake.substring(11);
            element = document.getElementsByTagName('mat-list-item')[
              toolIndex
            ] as HTMLElement;
            if (!element) {
              element = document.getElementsByClassName('mat-list-item')[
                toolIndex
              ] as HTMLElement;
              element.click();
            } else {
              element.click();
            }
          } else if (actionToMake.substring(0, 14) === 'clickOnContext') {
            const contextIndex = actionToMake.substring(14);
            element = document.getElementsByTagName('igo-context-item')[
              contextIndex
            ] as HTMLElement;
            element.click();
          } else if (actionToMake.substring(0, 12) === 'clickOnLayer') {
            const layerIndex = actionToMake.substring(12);
            element = document.getElementsByClassName('igo-layer-title')[
              layerIndex
            ] as HTMLElement;
            element.click();
          }
        }
      }
    });

    this.introJS.onafterchange(targetElement => {});

    const activeTourOptions: InteractiveTourOptions = this.interactiveTourLoader.getTourOptionData(toolName);
    if (activeTourOptions === undefined || activeTourOptions == null) {
      alert(`cet outil est inconnu du tourInteractif : ${toolName}`);
      return;
    }

    if (this.isInEnglish()) {
      for (let step of activeTourOptions.steps) {
        if (step.introEnglish) {
          step.intro = step.introEnglish;
        }
      }
    }

    this.introJS.setOptions(activeTourOptions);
    this.introJS.start();
  }
}
