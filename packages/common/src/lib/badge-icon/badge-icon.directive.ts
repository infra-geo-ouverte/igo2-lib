import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

@Directive({
  selector: '[igoMatBadgeIcon]'
})
export class MatBadgeIconDirective implements OnInit {
  @Input()
  set igoMatBadgeIcon(value: string) {
    this.matIconRegistry.getNamedSvgIcon(value).subscribe(svgObj => {
      this.svg = svgObj;
      if (this.badge) {
        this.badge.innerHTML = '';
        this.badge.appendChild(this.svg);
      }
    });
  }
  private svg: SVGElement;

  @Input()
  set matBadgeHidden(value: boolean) {
    this.hidden = value;
    if (this.badge) {
      this.badge.style.display = this.hidden ? 'none' : 'flex';
    }
  }
  private hidden = false;

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

    this.badge.style.display = this.hidden ? 'none' : 'flex';
    this.badge.innerHTML = '';
    this.badge.appendChild(this.svg);
  }
}
