import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  inject,
  input,
  viewChild
} from '@angular/core';

import { MediaService } from '@igo2/core/media';

import { Subscription } from 'rxjs';

import { FlexibleDirection, FlexibleState } from './flexible.type';

@Component({
  selector: 'igo-flexible',
  templateUrl: './flexible.component.html',
  styleUrls: ['./flexible.component.scss']
})
export class FlexibleComponent implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private mediaService = inject(MediaService);
  private cdr = inject(ChangeDetectorRef);

  static transitionTime = 250;

  readonly main = viewChild<ElementRef>('flexibleMain');

  readonly initial = input('0');
  readonly collapsed = input('0');
  readonly expanded = input('100%');
  readonly initialMobile = input('100%');
  readonly collapsedMobile = input('0');
  readonly expandedMobile = input('100%');
  readonly direction = input<FlexibleDirection>('column');

  @Input()
  get state(): FlexibleState {
    return this._state;
  }
  set state(value: FlexibleState) {
    const sizes: Record<string, unknown> = {
      initial: this.initial,
      collapsed: this.collapsed,
      expanded: this.expanded
    };

    if (this.mediaService.isMobile()) {
      Object.assign(sizes, {
        initial: this.initialMobile,
        collapsed: this.collapsedMobile,
        expanded: this.expandedMobile
      });
    }

    const size = sizes[value];
    if (size !== undefined) {
      this.setSize(size as string);
      setTimeout(() => {
        this._state = value;
      }, FlexibleComponent.transitionTime);
    }
  }
  private _state: FlexibleState = 'initial';

  private mediaService$$!: Subscription;

  ngOnInit() {
    this.el.nativeElement.className += this.direction;

    // Since this component supports different sizes
    // on mobile, force a redraw when the media changes
    this.mediaService$$ = this.mediaService.media$.subscribe(() =>
      this.cdr.markForCheck()
    );
  }

  ngOnDestroy() {
    if (this.mediaService$$) {
      this.mediaService$$.unsubscribe();
    }
  }

  private setSize(size: string) {
    this._state = 'transition';

    const el = this.main()?.nativeElement;
    if (!el) {
      return;
    }
    if (this.direction() === 'column') {
      el.style.height = size;
    } else if (this.direction() === 'row') {
      el.style.width = size;
    }
  }
}
