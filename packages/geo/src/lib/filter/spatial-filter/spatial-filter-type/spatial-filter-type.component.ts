import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';

/**
 * Spatial Filter Type
 */
@Component({
  selector: 'igo-spatial-filter-type',
  templateUrl: './spatial-filter-type.component.html',
  styleUrls: ['./spatial-filter-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpatialFilterTypeComponent {

  constructor() {}
}
