import {
  Directive,
  Input,
  ElementRef,
  OnInit,
} from '@angular/core';

@Directive({
  selector: '[igoMatBadgeIcon]'
})
export class MatBadgeIconDirective implements OnInit {

  @Input() matBadgeIcon: string;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const badge = this.el.nativeElement.querySelector('.mat-badge-content');
    badge.style.display = 'flex'; // Conflit avec matBadgeHidden ?
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.innerHTML = `<mat-icon svgIcon="${this.matBadgeIcon}"></mat-icon>`;
  }
}
