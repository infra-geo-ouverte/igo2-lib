import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { OnUpdateInputs } from '@igo2/common/dynamic-component';
import { WidgetComponent } from '@igo2/common/widget';

import { OgcFilterableItemComponent } from '../../../filter/ogc-filterable-item/ogc-filterable-item.component';
import { Layer } from '../../../layer/shared/layers/layer';
import { IgoMap } from '../../../map/shared/map';

@Component({
  selector: 'igo-ogc-filter',
  templateUrl: './ogc-filter.component.html',
  styleUrls: ['./ogc-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [OgcFilterableItemComponent]
})
export class OgcFilterComponent implements OnUpdateInputs, WidgetComponent {
  @Input() layer: Layer;

  @Input() map: IgoMap;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(private cdRef: ChangeDetectorRef) {}

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  /**
   * On close, emit the cancel event
   */
  onClose() {
    this.cancel.emit();
  }
}
