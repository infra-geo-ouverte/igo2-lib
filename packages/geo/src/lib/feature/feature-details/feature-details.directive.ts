import {
  Directive,
  ElementRef,
  HostListener,
  OnInit,
  inject,
  output
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { FeatureDetailsComponent } from './feature-details.component';

@Directive({
  // This directive allow to view the route between the user coordinates and the feature
  selector: '[igoFeatureDetailsDirective]',
  standalone: true
})
export class FeatureDetailsDirective implements OnInit {
  private el = inject(ElementRef);

  private component: FeatureDetailsComponent;

  get feature() {
    return this.component.feature;
  }
  feature$ = new BehaviorSubject(undefined);

  readonly routingEvent = output();

  @HostListener('selectFeature')
  setFeature() {
    this.feature$.next(this.feature);
  }

  constructor() {
    const component = inject(FeatureDetailsComponent, { self: true });

    this.component = component;
  }

  ngOnInit() {
    this.feature$.subscribe(() => {
      if (this.feature().geometry) {
        this.bindClicking();
      }
    });
  }

  bindClicking() {
    setTimeout(() => {
      const routeElement = this.el.nativeElement.querySelector('span.routing');
      if (routeElement) {
        routeElement.addEventListener('click', () => {
          // TODO: The 'emit' function requires a mandatory void argument
          this.routingEvent.emit();
        });
      }
    }, 1);
  }
}
