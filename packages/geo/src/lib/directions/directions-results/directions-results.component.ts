import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LanguageService } from '@igo2/core';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { Direction } from '../shared/directions.interface';
import { formatDistance, formatDuration, formatInstruction } from '../shared/directions.utils';
import { RoutesFeatureStore } from '../shared/store';

@Component({
  selector: 'igo-directions-results',
  templateUrl: './directions-results.component.html',
  styleUrls: ['./directions-results.component.scss']
})
export class DirectionsResultsComponent implements OnInit, OnDestroy {

  public activeDirection: Direction;
  public directions: Direction[];

  private entities$$: Subscription;

  @Input() routesFeatureStore: RoutesFeatureStore;

  constructor(
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.entities$$ = this.routesFeatureStore.entities$
      .pipe(debounceTime(200))
      .subscribe(entities => {
        const activeFeatureWithDirection = entities.find(entity => entity.properties.active);
        this.directions = entities.map(entity => entity.properties.direction);
        if (activeFeatureWithDirection) {
          this.activeDirection = activeFeatureWithDirection.properties.direction;
        } else {
          this.activeDirection = undefined;
        }
        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.entities$$.unsubscribe();
  }

  changeRoute() {
    this.routesFeatureStore.entities$.value.map(entity =>
      entity.properties.active = !entity.properties.active
    );
    this.routesFeatureStore.layer.ol.getSource().getFeatures().map(feature =>
      feature.set('active', !feature.get('active'))
    );
  }

  formatDistance(distance: number): string {
    return formatDistance(distance);
  }

  formatDuration(duration: number): string {
    return formatDuration(duration);
  }

  formatStep(step, cnt) {
    return formatInstruction(
      step.maneuver.type,
      step.maneuver.modifier,
      step.name,
      step.maneuver.bearing_after,
      cnt,
      step.maneuver.exit,
      this.languageService,
      cnt === this.activeDirection.steps.length - 1
    );
  }
}
