import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

/**
 * This directive allow to add an icon inside a matBadge.
 * A value must be set into the matBadge directive ex: matBadge="icon".
 * The badge content will be overrided by this current directive.
 */
@Directive({
  selector: '[igoMatBadgeIcon]'
})
export class IgoBadgeIconDirective implements OnInit {
  @Input()
  set igoMatBadgeIcon(value: string) {
    this.matIconRegistry.getNamedSvgIcon(value).subscribe((svgObj) => {
      this.svg = svgObj;
      this.updateSvg();
    });
  }
  private svg: SVGElement;

  @Input()
  set matBadgeHidden(value: boolean) {
    this.hidden = value;
    this.updateHidden();
  }
  private hidden = false;

  @Input()
  set matBadgeDisabled(value: boolean) {
    this.disabled = value;
    this.updateDisabled();
  }
  private disabled = false;

  @Input()
  set igoMatBadgeInverseColor(value: boolean) {
    this.inverseColor = value;
    this.updateColor();
  }
  private inverseColor = false;

  @Input()
  set igoMatBadgeInheritColor(value: boolean) {
    this.inheritColor = value;
    this.updateColor();
  }
  private inheritColor = false;

  @Input()
  set igoMatBadgeColor(value: string) {
    this.color = value;
    this.updateColor();
  }
  private color;

  @Input()
  set igoMatBadgeBackgroundColor(value: string) {
    this.backgroundColor = value;
    this.updateColor();
  }
  private backgroundColor;

  get badge() {
    return this.el.nativeElement.querySelector('.mat-badge-content');
  }

  private originalColor: string;

  constructor(
    private el: ElementRef,
    private matIconRegistry: MatIconRegistry
  ) {}

  ngOnInit() {
    this.badge.style.alignItems = 'center';
    this.badge.style.justifyContent = 'center';

    this.updateHidden();
    this.updateColor();
    this.updateSvg();
  }

  private updateSvg() {
    if (!this.badge) {
      return;
    }
    this.badge.innerHTML = '';
    if (this.svg) {
      this.badge.appendChild(this.svg);
    }
  }
  private updateColor() {
    if (!this.badge) {
      return;
    }

    if (this.color || this.backgroundColor) {
      this.badge.style.color = this.color ? this.color : '';
      this.badge.style.background = this.backgroundColor
        ? this.backgroundColor
        : '';
    } else if (this.inheritColor) {
      if (this.inverseColor) {
        this.badge.style.color = 'currentColor';
        this.badge.style.background = 'none';
      } else {
        this.badge.style.color = '';
        this.badge.style.background = 'currentColor';
      }
    } else if (!this.inheritColor) {
      if (this.inverseColor) {
        this.badge.style.color = window
          .getComputedStyle(this.badge, null)
          .getPropertyValue('background-color');
        this.badge.style.background = 'none';
      } else {
        this.badge.style.color = '';
        this.badge.style.background = '';
      }
    }
    this.originalColor = this.badge.style.color;
    this.updateDisabled();
  }

  private updateHidden() {
    if (!this.badge) {
      return;
    }
    this.badge.style.display = this.hidden ? 'none' : 'flex';
  }

  private updateDisabled() {
    if (!this.badge || !this.inverseColor) {
      return;
    }
    if (this.disabled) {
      this.originalColor = this.badge.style.color;
      this.badge.style.color = '#b9b9b9';
    } else {
      this.badge.style.color = this.originalColor;
    }
  }
}
