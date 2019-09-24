import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';

/**
 * Tool to measure lengths and areas
 */
@Component({
  selector: 'igo-spatial-filter-item',
  templateUrl: './spatial-filter-item.component.html',
  styleUrls: ['./spatial-filter-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpatialFilterItemComponent {

  constructor() {}
}
