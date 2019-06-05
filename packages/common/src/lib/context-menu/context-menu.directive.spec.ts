import { ContextMenuDirective } from './context-menu.directive';
import { Overlay } from '@angular/cdk/overlay';
import { ViewContainerRef } from '@angular/core';
import { inject } from '@angular/core/testing';
import { MockElementRef } from '../clickout/clickout.directive.spec';

describe('ContextMenuDirective', () => {
  it('should create an instance', () => {
    inject(
      [Overlay, ViewContainerRef],
      (overlay: Overlay, viewContainerRef: ViewContainerRef) => {
        const directive = new ContextMenuDirective(
          overlay,
          viewContainerRef,
          new MockElementRef({})
        );
        expect(directive).toBeTruthy();
      }
    );
  });
});
