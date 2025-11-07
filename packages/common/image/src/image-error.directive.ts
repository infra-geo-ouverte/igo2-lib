import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  inject
} from '@angular/core';

@Directive({
  selector: '[igoImageError]',
  standalone: true
})
export class ImageErrorDirective {
  private el = inject(ElementRef);

  @Input() errorImageUrl = './assets/igo2/common/images/na.png';
  @Input() hideError = false;

  @HostListener('error', ['$event'])
  public onError(event: any): void {
    if (this.hideError) {
      this.el.nativeElement.style.display = 'none';
    } else {
      event.target.src = this.errorImageUrl;
    }
  }
}
