import {
  Injectable
} from '@angular/core';

import { DynamicComponent, DynamicComponentService } from '../../dynamic-component';

import { WidgetComponent } from './widget.interfaces';

@Injectable({
  providedIn: 'root'
})
export class WidgetService {

  constructor(private dynamicComponentService: DynamicComponentService) {}

  create(widgetCls: any): DynamicComponent<WidgetComponent> {
    return this.dynamicComponentService.create(widgetCls as WidgetComponent);
  }
}
