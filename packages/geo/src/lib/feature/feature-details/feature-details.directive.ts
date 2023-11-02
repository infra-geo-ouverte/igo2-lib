import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  Self
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { FeatureDetailsComponent } from './feature-details.component';

@Directive({
  // This directive allow to view the route between the user coordinates and the feature
  selector: '[igoFeatureDetailsDirective]'
})
export class FeatureDetailsDirective implements OnInit {
  private component: FeatureDetailsComponent;

  get feature() {
    return this.component.feature;
  }
  feature$ = new BehaviorSubject(undefined);

  @Output() routingEvent = new EventEmitter<void>();

  @HostListener('selectFeature')
  setFeature() {
    this.feature$.next(this.feature);
  }

  constructor(
    @Self() component: FeatureDetailsComponent,
    private el: ElementRef
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.feature$.subscribe(() => {
      if (this.feature.geometry) {
        this.bindClicking();
      }
    });
  }

  bindClicking() {
    setTimeout(() => {
      const routeElement = this.el.nativeElement.querySelector('span.routing');
      if (routeElement) {
        routeElement.addEventListener('click', () => {
          this.routingEvent.emit();
        });
      }
    }, 1);
  }
}
