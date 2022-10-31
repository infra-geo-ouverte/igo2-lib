import {
  Directive,
  HostListener,
  Input,
  ElementRef
} from '@angular/core';

@Directive({
  selector: '[igoImageError]'
})
export class ImageErrorDirective {

  @Input() errorImageUrl: string = '/assets/igo2/common/images/na.png';
  @Input() hideError: boolean = false;

  constructor(private el: ElementRef) {}

  @HostListener("error", ['$event'])
  public onError(event: any): void {
    if (this.hideError) {
      this.el.nativeElement.style.display = "none";
    } else {
      event.target.src = this.errorImageUrl;
    }

   // 
  }

}
