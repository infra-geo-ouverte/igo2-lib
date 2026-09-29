import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  inject,
  input,
  numberAttribute,
  output,
  signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IgoLanguageModule } from '@igo2/core/language';

import { ResizeDirective } from './shared/resize.directive';

export const ResizeAnchorType = ['top', 'left', 'bottom', 'right'] as const;
export type ResizeAnchorType = (typeof ResizeAnchorType)[number];

export const AlignmentType = ['vertical', 'horizontal'] as const;
export type AlignmentType = (typeof AlignmentType)[number];

@Component({
  selector: 'igo-resizable-bar',
  templateUrl: './resizable-bar.component.html',
  styleUrls: ['./resizable-bar.component.scss'],
  imports: [
    MatIconModule,
    MatButtonModule,
    ResizeDirective,
    NgClass,
    IgoLanguageModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizableBarComponent implements OnInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  alignement!: AlignmentType;
  iconRotation!: string;

  readonly tooltipVisible = signal(false);
  readonly tooltipPosition = signal({ x: 0, y: 0 });

  readonly anchor = input<ResizeAnchorType>('right');

  /** En pixel */
  readonly min = input<number, unknown>(undefined, {
    transform: numberAttribute
  });

  /** En pixel */
  readonly max = input<number, unknown>(undefined, {
    transform: numberAttribute
  });

  readonly change = output<MouseEvent>();

  @HostBinding('class') get cssClass() {
    return `${this.alignement} ${this.anchor()}`;
  }

  ngOnInit(): void {
    const anchor = this.anchor();
    this.alignement =
      anchor === 'top' || anchor === 'bottom' ? 'horizontal' : 'vertical';

    this.iconRotation = this.alignement === 'vertical' ? 'rotate(90deg)' : '';
  }

  onContainerMouseMove(event: MouseEvent): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.tooltipPosition.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    this.tooltipVisible.set(true);
  }

  onContainerMouseLeave(): void {
    this.tooltipVisible.set(false);
  }

  onChange(event: MouseEvent): void {
    const value =
      this.alignement === 'horizontal' ? event.clientX : event.clientX;
    const min = this.min();
    const max = this.max();
    if ((min && value <= min) || (max && value >= max)) {
      return;
    }
    this.change.emit(event);
  }
}
