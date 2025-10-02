import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  numberAttribute
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

  @Input() anchor: ResizeAnchorType = 'right';

  /** En pixel */
  @Input({ transform: numberAttribute }) min: number;

  /** En pixel */
  @Input({ transform: numberAttribute }) max: number;

  @Output() change = new EventEmitter<MouseEvent>();

  @HostBinding('class') get cssClass() {
    return `${this.alignement} ${this.anchor}`;
  }

  ngOnInit(): void {
    this.alignement =
      this.anchor === 'top' || this.anchor === 'bottom'
        ? 'horizontal'
        : 'vertical';

    this.iconRotation = this.alignement === 'vertical' ? 'rotate(90deg)' : '';
  }

  onChange(event: MouseEvent): void {
    const value =
      this.alignement === 'horizontal' ? event.clientX : event.clientX;
    if ((this.min && value <= this.min) || (this.max && value >= this.max)) {
      return;
    }
    this.change.emit(event);
  }
}
