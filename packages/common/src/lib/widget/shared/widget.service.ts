import {
  Injectable
} from '@angular/core';

import { DynamicComponent } from '../../dynamic-component/shared/dynamic-component';
import { DynamicComponentService } from '../../dynamic-component/shared/dynamic-component.service';

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
