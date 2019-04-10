import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { Layer } from '../shared/layers';

@Component({
  selector: 'igo-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerItemComponent implements OnInit, OnDestroy {

  showLegend$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  inResolutionRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  private resolution$$: Subscription;

  @Input() layer: Layer;

  @Input() toggleLegendOnVisibilityChange: boolean = false;

  @Input() orderable: boolean = true;

  get removable(): boolean { return this.layer.options.removable !== false; }

  get opacity() { return this.layer.opacity * 100; }
  set opacity(opacity: number) { this.layer.opacity = opacity / 100; }

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    const legend = this.layer.dataSource.options.legend || {};
    const legendCollapsed = legend.collapsed === false ? false : true;
    this.showLegend$.next(!legendCollapsed);

    const resolution$ = this.layer.map.viewController.resolution$;
    this.resolution$$ = resolution$.subscribe((resolution: number) => {
      this.onResolutionChange(resolution);
    });
  }

  ngOnDestroy() {
    this.resolution$$.unsubscribe();
  }

  toggleLegend(collapsed: boolean) {
    this.showLegend$.next(!collapsed);
  }

  toggleVisibility() {
    this.layer.visible = !this.layer.visible;
    if (this.toggleLegendOnVisibilityChange) {
      this.toggleLegend(!this.layer.visible);
    }
  }

  private onResolutionChange(resolution: number) {
    this.inResolutionRange$.next(this.layer.isInResolutionsRange);
  }
}
