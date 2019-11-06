import { ElementRef } from '@angular/core';

import { MatBadgeIconDirective } from './badge-icon.directive';

export class MockElementRef extends ElementRef {}

describe('MatBadgeIconDirective', () => {
  it('should create an instance', () => {
    const directive = new MatBadgeIconDirective(new MockElementRef({}));
    expect(directive).toBeTruthy();
  });
});
