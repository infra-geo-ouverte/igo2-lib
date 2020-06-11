import { Injectable } from '@angular/core';
import { ConfigService, MediaService, LanguageService } from '@igo2/core';
import { introJs } from 'intro.js/intro.js';

@Injectable({
  providedIn: 'root'
})
export class InteractiveTourService {

  public introJS = introJs();
  private tourActiveOption;
  constructor(private configService: ConfigService, private mediaService: MediaService, private languageService: LanguageService) {}

  public isToolHaveTourConfig(toolName) {
    let nameInConfigFile = 'introOptions_' + toolName;
    nameInConfigFile = nameInConfigFile.replace(/\s/g, '');
    const tourActiveOption = this.configService.getConfig(nameInConfigFile);

    if (tourActiveOption == null) {
      return false;
    } else {
      return true;
    }
  }

  public isMobile() {
    const media = this.mediaService.getMedia();
    if (media === 'mobile') {
      return true;
    } else {
      return false;
    }
  }

  public isTourDisplayInMobile() {

    const showInMobile = this.configService.getConfig('introInteractiveTourInMobile');
    if (showInMobile === undefined) {
      return true;
    }
    return this.configService.getConfig('introInteractiveTourInMobile');
  }

  private isInEnglish() {
    const lang = this.languageService.getLanguage();
    if (lang === 'en' || lang === 'EN') {
      return true;
    } else {
      return false;
    }
  }

  public startTour(tourTool) {

    this.introJS.oncomplete( () =>  {
      console.log('fin du tour');
    });

    this.introJS.onexit( () =>  {
      console.log('le tour a ete fermé');
    });

    this.introJS.onbeforechange(targetElement => {

      const tourNo: number = this.introJS._currentStep;
      console.log('tourNo');
      console.log(tourNo);
      console.log(targetElement.className );

      // When the element doesn't exist when you start tour
      // we need to set it when it exist
      if (targetElement.className.indexOf('introjsFloatingElement') !== -1) {
        console.log('target = elem doesnt exist');
        const currentStepConfig = this.tourActiveOption.steps[tourNo];
        const currentElemConfig = currentStepConfig.element;
        const currentPositionElemConfig = currentStepConfig.position;
        // maybe more properties need to be set here...

        let unElem: HTMLElement;
        unElem = document.getElementsByTagName(currentElemConfig)[0] as HTMLElement;

        if (!unElem) {
          console.log('elem est vide avec tagName');
          unElem = document.getElementsByClassName(currentElemConfig)[0] as HTMLElement;
          if (!unElem) {
              console.log('elem est vide avec ClassName');
              unElem = document.querySelector(currentElemConfig);
              if (!unElem) {
                console.log('elem est vide avec querySelector');
                unElem = document.getElementById(currentElemConfig) as HTMLElement;
                if (!unElem) {
                  console.log('elem est vide avec getelemById');

                } else {
                  console.log('elem est OK avec ById');
                  this.introJS._introItems[tourNo].element = unElem;
                  this.introJS._introItems[tourNo].position = currentPositionElemConfig;
                }
              } else {
                console.log('elem est OK avec QuerySelector');
                this.introJS._introItems[tourNo].element = unElem;
                this.introJS._introItems[tourNo].position = currentPositionElemConfig;
              }

          } else {
              console.log('elem est OK avec ClassName');
              this.introJS._introItems[tourNo].element = unElem;
              this.introJS._introItems[tourNo].position = currentPositionElemConfig;
          }

        } else {
          console.log('est OK avec tagName');
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

          if (actionToMake === 'clickOnMenu') {
            // back to initial menu
              const elemHomeBut: HTMLElement = document.querySelector('#homeButton') as HTMLElement;
              if (elemHomeBut) {
                elemHomeBut.click();
              }

              const elemMenuBut: HTMLElement = document.querySelector('#menu-button') as HTMLElement;
              elemMenuBut.click();

          } else if (actionToMake === 'clickOnElem') {
                targetElement.click();

          } else if (actionToMake.substring(0, 11) === 'clickOnTool') {
            const toolIndex = actionToMake.substring(11) ;
            element = document.getElementsByTagName('mat-list-item')[toolIndex] as HTMLElement;
            if (!element) {
              // console.log('click, est vide avec tagNam')
              element = document.getElementsByClassName('mat-list-item')[toolIndex] as HTMLElement;
              element.click();
            } else {
            element.click();
            }

          } else if (actionToMake.substring(0, 14) === 'clickOnContext') {
            const contextIndex = actionToMake.substring(14) ;
            element = document.getElementsByTagName('igo-context-item')[contextIndex] as HTMLElement;
            element.click();

          } else if (actionToMake.substring(0, 12) === 'clickOnLayer') {
            const layerIndex = actionToMake.substring(12) ;
            element = document.getElementsByClassName('igo-layer-title')[layerIndex] as HTMLElement;
            element.click();
          }
        }
      }
    });

    this.introJS.onafterchange(targetElement => {});
    let nameInConfigFile = 'introOptions_' + tourTool;
    nameInConfigFile = nameInConfigFile.replace(/\s/g, '');

    this.tourActiveOption = this.configService.getConfig(nameInConfigFile);
    if (this.isInEnglish()) {
      for (let step of this.tourActiveOption.steps) {
        if (step.introEnglish) {
          step.intro = step.introEnglish;
        }
      }
    }

    if (this.tourActiveOption == null) {
      alert(`cet outil est inconnu du tourInteractif : ${tourTool}`) ;
      return;
    } else {
      this.introJS.setOptions(this.tourActiveOption);
    }

    this.introJS.start();
  }
}
