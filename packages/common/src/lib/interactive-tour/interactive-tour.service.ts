import { Injectable } from '@angular/core';
import { ConfigService} from '@igo2/core';
import { introJs } from 'intro.js/intro.js';

@Injectable({
  providedIn: 'root'
})
export class InteractiveTourService {

  public introJS = introJs();

  constructor(private configService: ConfigService) {}

  // .configTourForTool('measurer');

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

        const currentStepConfig = this.configService.getConfig('introOptions').steps[tourNo];
        const currentElemConfig = currentStepConfig.element;
        const currentPositionElemConfig = currentStepConfig.position;

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
    let nameInConfigFile = 'introOptions' + tourTool;
    nameInConfigFile = nameInConfigFile.replace(/\s/g, '');
    // debugger;

    const tourOptions = this.configService.getConfig(nameInConfigFile);

    if (tourOptions == null) {
      alert(`cet outil est inconnu du tourInteractif : ${tourTool}`) ;
      alert(tourTool) ;
      return;
    } else {
      this.introJS.setOptions(tourOptions);
    }

    this.introJS.start();
  }
}
