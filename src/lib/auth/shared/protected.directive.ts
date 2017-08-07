import { Directive, ElementRef } from '@angular/core';
import { AuthService } from './index';

@Directive({
    selector: "[igoProtected]"
})

export class ProtectedDirective {
    constructor(authentication: AuthService, el: ElementRef) {
        if (!authentication.isAuthenticated()) {
            el.nativeElement.parentNode.removeChild(el.nativeElement);
        }
    }
}
