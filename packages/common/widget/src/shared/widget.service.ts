import { Injectable, inject } from '@angular/core';

import { DynamicComponentService } from '@igo2/common/dynamic-component';

import { Widget } from './widget';
import { WidgetComponent } from './widget.interfaces';

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  private dynamicComponentService = inject(DynamicComponentService);

  create(widgetCls: any): Widget {
    return this.dynamicComponentService.create(widgetCls as WidgetComponent);
  }
}
