import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'igo-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        position: fixed;
        pointer-events: none;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        row-gap: 8px;
      }

      :host.toast-bottom-right {
        bottom: 12px;
        right: 12px;
        align-items: flex-end;
      }

      :host.toast-bottom-left {
        bottom: 12px;
        left: 12px;
        align-items: flex-start;
      }

      :host.toast-top-right {
        top: 12px;
        right: 12px;
        align-items: flex-end;
      }

      :host.toast-top-left {
        top: 12px;
        left: 12px;
        align-items: flex-start;
      }

      :host.toast-top-center {
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        align-items: center;
      }

      :host.toast-bottom-center {
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        align-items: center;
      }
    `
  ]
})
export class ToastContainerComponent {}
