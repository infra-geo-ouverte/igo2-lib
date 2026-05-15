import { AsyncPipe } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject
} from '@angular/core';

import '@geostyler/web-component/geostyler-web-component';
import { Style as GsStyle } from 'geostyler-style';

import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { LayerStylingService } from './layer-styling.service';

@Component({
  selector: 'igo-layer-styling',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [LayerStylingService],
  templateUrl: './layer-styling.component.html',
  imports: [AsyncPipe]
})
export class LayerStylingComponent implements OnInit, OnChanges {
  private stylingService = inject(LayerStylingService);
  @Input({ required: true }) layer: VectorLayer;
  @Input() initialStyle?: GsStyle;

  layerData$ = this.stylingService.layerData$;

  ngOnInit(): void {
    if (this.layer) {
      this.stylingService.selectLayer(this.layer);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['layer']?.currentValue) {
      this.stylingService.selectLayer(changes['layer'].currentValue);
    }
  }

  onStyleChange(event: Event): void {
    const newStyle = (event as CustomEvent<GsStyle>).detail;
    this.stylingService.updateLayerStyle(newStyle);
  }
}
