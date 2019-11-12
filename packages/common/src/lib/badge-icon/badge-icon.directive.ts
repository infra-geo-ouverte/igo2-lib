import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material';

@Directive({
  selector: '[igoMatBadgeIcon]'
})
export class MatBadgeIconDirective implements OnInit {
  @Input()
  set igoMatBadgeIcon(value: string) {
    this.matIconRegistry
      .getNamedSvgIcon(value)
      .subscribe(svgObj => {
        this.badge.innerHTML = '';
        this.badge.appendChild(svgObj);
      });
  }

  @Input()
  set matBadgeHidden(value: boolean) {
    this.badge.style.display = value
      ? 'none'
      : 'flex';
  }

  get badge() {
    return this.el.nativeElement.querySelector('.mat-badge-content');
  }

  constructor(
    private el: ElementRef,
    private matIconRegistry: MatIconRegistry
  ) {}

  ngOnInit() {
    this.badge.style.alignItems = 'center';
    this.badge.style.justifyContent = 'center';
    this.badge.style.background = 'none';
  }
}
