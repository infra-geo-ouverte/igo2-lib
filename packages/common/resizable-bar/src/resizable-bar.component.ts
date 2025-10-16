import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
  input,
  numberAttribute,
  output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ResizeDirective } from './shared/resize.directive';

export const ResizeAnchorType = ['top', 'left', 'bottom', 'right'] as const;
export type ResizeAnchorType = (typeof ResizeAnchorType)[number];

export const AlignmentType = ['vertical', 'horizontal'] as const;
export type AlignmentType = (typeof AlignmentType)[number];

@Component({
  selector: 'igo-resizable-bar',
  templateUrl: './resizable-bar.component.html',
  styleUrls: ['./resizable-bar.component.scss'],
  imports: [MatIconModule, MatButtonModule, ResizeDirective, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizableBarComponent implements OnInit {
  alignement: AlignmentType;
  iconRotation: string;

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
