import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material';

@Directive({
  selector: '[igoMatBadgeIcon]'
})
export class MatBadgeIconDirective implements OnInit {
  @Input() igoMatBadgeIcon: string;

  constructor(
    private el: ElementRef,
    private matIconRegistry: MatIconRegistry
  ) {}

  ngOnInit() {
    const badge = this.el.nativeElement.querySelector('.mat-badge-content');
    this.matIconRegistry
      .getNamedSvgIcon(this.igoMatBadgeIcon)
      .subscribe(svgObj => {
        // badge.style.display = this.el.nativeElement.classList.contains(
        //   'mat-badge-hidden'
        // )
        //   ? 'hidden'
        //   : 'flex';
        badge.style.alignItems = 'center';
        badge.style.justifyContent = 'center';
        badge.appendChild(svgObj);
      });
  }
}
