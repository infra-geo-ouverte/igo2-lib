import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  output
} from '@angular/core';

import { OnUpdateInputs } from '@igo2/common/dynamic-component';
import { WidgetComponent } from '@igo2/common/widget';

import { OgcFilterableItemComponent } from '../../../filter/ogc-filterable-item/ogc-filterable-item.component';
import { Layer } from '../../../layer';
import { IgoMap } from '../../../map/shared/map';

@Component({
  selector: 'igo-ogc-filter',
  templateUrl: './ogc-filter.component.html',
  styleUrls: ['./ogc-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OgcFilterableItemComponent]
})
export class OgcFilterComponent implements OnUpdateInputs, WidgetComponent {
  private cdRef = inject(ChangeDetectorRef);

  readonly layer = input<Layer>(undefined);

  readonly map = input<IgoMap>(undefined);

  /**
   * Event emitted on complete
   */
  readonly complete = output<void>();

  /**
   * Event emitted on cancel
   */
  readonly cancel = output<void>();

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
    // TODO: The 'emit' function requires a mandatory void argument
    this.cancel.emit();
  }
}
