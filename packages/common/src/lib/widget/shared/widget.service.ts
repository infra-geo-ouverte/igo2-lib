import { Injectable } from '@angular/core';

import { DynamicComponentService } from '../../dynamic-component/shared/dynamic-component.service';

import { Widget } from './widget';
import { WidgetComponent } from './widget.interfaces';

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  constructor(private dynamicComponentService: DynamicComponentService) {}

  create(widgetCls: any): Widget {
    return this.dynamicComponentService.create(widgetCls as WidgetComponent);
  }
}
