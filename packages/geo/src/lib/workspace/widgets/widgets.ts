import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common/widget';

import { OgcFilterComponent } from './ogc-filter/ogc-filter.component';

export const OgcFilterWidget = new InjectionToken<Widget>('OgcFilterWidget');

export function ogcFilterWidgetFactory(widgetService: WidgetService): Widget {
  return widgetService.create(OgcFilterComponent);
}

export function provideOgcFilterWidget() {
  return {
    provide: OgcFilterWidget,
    useFactory: ogcFilterWidgetFactory,
    deps: [WidgetService]
  };
}
