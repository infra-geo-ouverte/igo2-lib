import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LanguageService } from '@igo2/core';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { FeatureStore } from '../../feature/shared/store';

import { Direction, FeatureWithDirection } from '../shared/directions.interface';
import { formatDistance, formatDuration, formatInstruction } from '../shared/directions.utils';

@Component({
  selector: 'igo-directions-results',
  templateUrl: './directions-results.component.html',
  styleUrls: ['./directions-results.component.scss']
})
export class DirectionsResultsComponent implements OnInit, OnDestroy {

  public activeDirection: Direction;
  public directions: Direction[];

  private entities$$: Subscription;

  @Input() routesFeatureStore: FeatureStore<FeatureWithDirection>;

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
