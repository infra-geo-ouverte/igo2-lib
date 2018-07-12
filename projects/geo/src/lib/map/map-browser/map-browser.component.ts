import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';

import { SubjectStatus } from '@igo2/utils';
import { ActivityService } from '@igo2/core';

import { IgoMap, MapViewOptions } from '../shared';

@Component({
  selector: 'igo-map-browser',
  templateUrl: './map-browser.component.html',
  styleUrls: ['./map-browser.component.scss']
})
export class MapBrowserComponent implements OnInit, AfterViewInit, OnDestroy {
  private activityId: string;
  private status$$: Subscription;

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap = new IgoMap();

  @Input()
  get view(): MapViewOptions {
    return this._view;
  }
  set view(value: MapViewOptions) {
    this._view = value;
    if (this.map !== undefined) {
      this.map.setView(value);
    }
  }
  private _view: MapViewOptions;

  public id = `igo-map-target-${new Date().getTime()}`;

  constructor(private activityService: ActivityService) {}

  ngOnInit() {
    this.status$$ = this.map.status$.subscribe(status =>
      this.handleStatusChange(status)
    );
  }

  ngAfterViewInit() {
    this.map.setTarget(this.id);
  }

  ngOnDestroy() {
    this.map.setTarget(undefined);
    this.activityService.unregister(this.activityId);
    this.status$$.unsubscribe();
  }

  private handleStatusChange(status: SubjectStatus) {
    if (status === SubjectStatus.Working && this.activityId === undefined) {
      this.activityId = this.activityService.register();
    } else if (status === SubjectStatus.Done && this.activityId !== undefined) {
      this.activityService.unregister(this.activityId);
      this.activityId = undefined;
    }
  }
}
