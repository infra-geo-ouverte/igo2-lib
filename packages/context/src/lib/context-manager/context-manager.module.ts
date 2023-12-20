import { ModuleWithProviders, NgModule } from '@angular/core';

import { ContextEditBindingDirective } from './context-edit/context-edit-binding.directive';
import { ContextEditComponent } from './context-edit/context-edit.component';
import { ContextFormComponent } from './context-form/context-form.component';
import { ContextItemComponent } from './context-item/context-item.component';
import { ContextListBindingDirective } from './context-list/context-list-binding.directive';
import { ContextListComponent } from './context-list/context-list.component';
import { ContextPermissionsBindingDirective } from './context-permissions/context-permissions-binding.directive';
import { ContextPermissionsComponent } from './context-permissions/context-permissions.component';
import { LayerContextDirective } from './shared/layer-context.directive';
import { MapContextDirective } from './shared/map-context.directive';

/**
 * @deprecated import the components/directives directly or CONTEXT_MANAGER_DIRECTIVES for everything
 */
@NgModule({
  imports: [
    ContextListComponent,
    ContextListBindingDirective,
    ContextItemComponent,
    ContextFormComponent,
    ContextEditComponent,
    ContextEditBindingDirective,
    ContextPermissionsComponent,
    ContextPermissionsBindingDirective,
    LayerContextDirective,
    MapContextDirective
  ],
  exports: [
    ContextListComponent,
    ContextListBindingDirective,
    ContextItemComponent,
    ContextFormComponent,
    ContextEditComponent,
    ContextEditBindingDirective,
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
