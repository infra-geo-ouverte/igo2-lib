import { Directive, ElementRef } from '@angular/core';

import { AuthService } from './auth.service';

@Directive({
  selector: '[igoProtected]'
})
export class ProtectedDirective {
  constructor(authentication: AuthService, el: ElementRef) {
    if (!authentication.isAuthenticated()) {
      el.nativeElement.parentNode.removeChild(el.nativeElement);
    }
  }
}
