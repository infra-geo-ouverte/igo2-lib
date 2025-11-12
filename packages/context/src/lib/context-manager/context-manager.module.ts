import { ModuleWithProviders, NgModule } from '@angular/core';

import { ContextEditComponent } from './context-edit/context-edit.component';
import { ContextFormComponent } from './context-form/context-form.component';
import { ContextItemComponent } from './context-item/context-item.component';
import { ContextListComponent } from './context-list/context-list.component';
import { ContextPermissionsBindingDirective } from './context-permissions/context-permissions-binding.directive';
import { ContextPermissionsComponent } from './context-permissions/context-permissions.component';
import { LayerContextDirective } from './shared/layer-context.directive';
import { MapContextDirective } from './shared/map-context.directive';

/**
 * @deprecated import the components/directives directly or CONTEXT_MANAGER_DIRECTIVES for the set
 */
@NgModule({
  imports: [
    ContextListComponent,
    ContextItemComponent,
    ContextFormComponent,
    ContextEditComponent,
    ContextPermissionsComponent,
    ContextPermissionsBindingDirective,
    LayerContextDirective,
    MapContextDirective
  ],
  exports: [
    ContextListComponent,
    ContextItemComponent,
    ContextFormComponent,
    ContextEditComponent,
    ContextPermissionsComponent,
    ContextPermissionsBindingDirective,
    LayerContextDirective,
    MapContextDirective
  ]
})
export class IgoContextManagerModule {
  static forRoot(): ModuleWithProviders<IgoContextManagerModule> {
    return {
      ngModule: IgoContextManagerModule
    };
  }
}
