import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common/widget';

import { InteractiveSelectionFormComponent } from './interactive-selection/interactive-selection.component';
import { OgcFilterComponent } from './ogc-filter/ogc-filter.component';

export const OgcFilterWidget = new InjectionToken<Widget>('OgcFilterWidget');
export const InteractiveSelectionFormWidget = new InjectionToken<Widget>(
  'InteractiveSelectionFormWidget'
);

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

export function interactiveSelectionFormWidgetFactory(
  widgetService: WidgetService
): Widget {
  return widgetService.create(InteractiveSelectionFormComponent);
}

export function provideInteractiveSelectionFormWidget() {
  return {
    provide: InteractiveSelectionFormWidget,
    useFactory: interactiveSelectionFormWidgetFactory,
    deps: [WidgetService]
  };
}
