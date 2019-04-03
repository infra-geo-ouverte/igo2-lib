import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { OnUpdateInputs, WidgetComponent } from '@igo2/common';

import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map/shared/map';

@Component({
  selector: 'igo-wfs-ogc-filter',
  templateUrl: './wfs-ogc-filter.component.html',
  styleUrls: ['./wfs-ogc-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WfsOgcFilterComponent implements OnUpdateInputs, WidgetComponent {

  @Input() layer: Layer;

  @Input() map: IgoMap;

  @Input() showFeatureOnMap: boolean = true;

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
