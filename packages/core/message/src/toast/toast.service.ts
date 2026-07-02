import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  Injectable,
  createComponent,
  inject
} from '@angular/core';

import { ToastContainerComponent } from './toast-container.component';
import {
  DEFAULT_TOAST_CONFIG,
  IndividualToastConfig,
  ToastConfig,
  ToastRef,
  ToastType
} from './toast.interface';
import { ToastComponent } from './toast/toast.component';

export interface ActiveToast {
  toastId: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private appRef = inject(ApplicationRef);
  private document = inject(DOCUMENT);

  private toastIdCounter = 0;
  private toasts: Map<number, ComponentRef<ToastComponent>> = new Map();
  private containerRef: ComponentRef<ToastContainerComponent> | null = null;
  private config: ToastConfig = { ...DEFAULT_TOAST_CONFIG };
  private lastMessage = '';
  private lastTitle = '';

  configure(config: Partial<ToastConfig>) {
    this.config = { ...this.config, ...config };
  }

  success(
    message: string,
    title: string,
    options?: IndividualToastConfig
  ): ActiveToast {
    return this.show('success', message, title, options);
  }

  error(
    message: string,
    title: string,
    options?: IndividualToastConfig
  ): ActiveToast {
    return this.show('error', message, title, options);
  }

  info(
    message: string,
    title: string,
    options?: IndividualToastConfig
  ): ActiveToast {
    return this.show('info', message, title, options);
  }

  warning(
    message: string,
    title: string,
    options?: IndividualToastConfig
  ): ActiveToast {
    return this.show('warning', message, title, options);
  }

  remove(toastId: number) {
    const ref = this.toasts.get(toastId);
    if (ref) {
      ref.instance.remove();
    }
  }

  /** Called by ToastComponent when removal animation completes */
  removeToast(toastId: number) {
    const ref = this.toasts.get(toastId);
    if (ref) {
      this.appRef.detachView(ref.hostView);
      ref.destroy();
      this.toasts.delete(toastId);
    }
    if (this.toasts.size === 0 && this.containerRef) {
      this.appRef.detachView(this.containerRef.hostView);
      this.containerRef.destroy();
      this.containerRef = null;
    }
  }

  getActiveToasts(): ToastRef[] {
    return Array.from(this.toasts.entries()).map(([id, ref]) => ({
      toastId: id,
      message: ref.instance.message,
      title: ref.instance.title,
      type: ref.instance.type,
      config: ref.instance.config as ToastConfig
    }));
  }

  updateToast(toastId: number, message: string, title: string) {
    const ref = this.toasts.get(toastId);
    if (ref) {
      ref.instance.message = message;
      ref.instance.title = title;
    }
  }

  private show(
    type: ToastType,
    message: string,
    title: string,
    options?: IndividualToastConfig
  ): ActiveToast {
    const mergedConfig = { ...this.config, ...options };

    // Prevent duplicates
    if (mergedConfig.preventDuplicates) {
      if (this.lastMessage === message && this.lastTitle === title) {
        // Return last toast id
        const lastEntry = Array.from(this.toasts.entries()).pop();
        if (lastEntry) {
          return { toastId: lastEntry[0] };
        }
      }
    }

    // Enforce max opened
    if (mergedConfig.maxOpened && this.toasts.size >= mergedConfig.maxOpened) {
      const firstKey = this.toasts.keys().next().value!;
      this.remove(firstKey);
    }

    this.lastMessage = message;
    this.lastTitle = title;

    const toastId = ++this.toastIdCounter;
    const container = this.getOrCreateContainer(
      mergedConfig.positionClass || 'toast-bottom-right'
    );

    const toastRef = createComponent(ToastComponent, {
      environmentInjector: this.appRef.injector
    });

    toastRef.instance.toastId = toastId;
    toastRef.instance.type = type;
    toastRef.instance.message = message;
    toastRef.instance.title = title;
    toastRef.instance.config = mergedConfig as any;
    toastRef.instance.enableHtml = mergedConfig.enableHtml ?? true;
    toastRef.instance.showIcon = mergedConfig.showIcon ?? false;

    this.toasts.set(toastId, toastRef);
    this.appRef.attachView(toastRef.hostView);
    container.location.nativeElement.appendChild(
      toastRef.location.nativeElement
    );

    return { toastId };
  }

  private getOrCreateContainer(
    positionClass: string
  ): ComponentRef<ToastContainerComponent> {
    if (this.containerRef) {
      return this.containerRef;
    }

    this.containerRef = createComponent(ToastContainerComponent, {
      environmentInjector: this.appRef.injector
    });

    this.appRef.attachView(this.containerRef.hostView);
    const el = this.containerRef.location.nativeElement as HTMLElement;
    el.classList.add(positionClass);
    this.document.body.appendChild(el);
    return this.containerRef;
  }
}
