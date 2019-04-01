

import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import { WfsOgcFilterComponent } from './wfs-ogc-filter.component';

export const WfsOgcFilterWidget = new InjectionToken<Widget>('WfsOgcFilterWidget');

export function wfsOgcFilterWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(WfsOgcFilterComponent);
}

export function provideWfsOgcFilterWidget() {
  return {
    provide: WfsOgcFilterWidget,
    useFactory: wfsOgcFilterWidgetFactory,
    deps: [WidgetService]
  };
}
