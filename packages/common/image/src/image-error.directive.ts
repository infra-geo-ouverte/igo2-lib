import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[igoImageError]',
  standalone: true
})
export class ImageErrorDirective {
  @Input() errorImageUrl: string = './assets/igo2/common/images/na.png';
  @Input() hideError: boolean = false;

  constructor(private el: ElementRef) {}

  @HostListener('error', ['$event'])
  public onError(event: any): void {
    if (this.hideError) {
      this.el.nativeElement.style.display = 'none';
    } else {
      event.target.src = this.errorImageUrl;
    }
  }
}
