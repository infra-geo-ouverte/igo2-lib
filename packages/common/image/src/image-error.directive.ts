import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input
} from '@angular/core';

@Directive({
  selector: '[igoImageError]'
})
export class ImageErrorDirective {
  private el = inject(ElementRef);

  readonly errorImageUrl = input('./igo2/common/images/na.png');
  readonly hideError = input(false);

  @HostListener('error', ['$event'])
  public onError(event: any): void {
    if (this.hideError()) {
      this.el.nativeElement.style.display = 'none';
    } else {
      event.target.src = this.errorImageUrl();
    }
  }
}
