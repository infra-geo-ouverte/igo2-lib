import { ComponentFactoryResolver, Injectable, inject } from '@angular/core';

import { DynamicComponent } from './dynamic-component';

/**
 * Service to creates DynamicComponent instances from base component classes
 */
@Injectable({
  providedIn: 'root'
})
export class DynamicComponentService {
  private resolver = inject(ComponentFactoryResolver);

  /**
   * Creates a DynamicComponent instance from a base component class
   * @param componentCls The component class
   * @returns DynamicComponent instance
   */
  create(componentCls: any): DynamicComponent<any> {
    const factory = this.resolver.resolveComponentFactory(componentCls as any);
    return new DynamicComponent<typeof componentCls>(factory);
  }
}
