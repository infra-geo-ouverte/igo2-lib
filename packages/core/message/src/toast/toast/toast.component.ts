import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { ToastConfig, ToastType } from '../toast.interface';
import { ToastService } from '../toast.service';

@Component({
  selector: 'igo-toast',
  standalone: true,
  imports: [NgClass, MatIconModule, MatIconButton, MatProgressBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  host: {
    '[class]': 'animationState()',
    '(mouseenter)': 'onEnter()',
    '(mouseleave)': 'onLeave()',
    '(touchstart)': 'onEnter()',
    '(touchend)': 'onLeave()'
  }
})
export class ToastComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private sanitizer = inject(DomSanitizer);

  toastId!: number;
  type!: ToastType;
  title = '';
  config!: ToastConfig;
  enableHtml = false;
  showIcon = false;

  private _message = '';
  safeMessage: SafeHtml = '';

  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this._message = value;
    this.safeMessage = this.sanitizer.bypassSecurityTrustHtml(value);
  }

  progress = signal(100);
  animationState = signal<'inactive' | 'active' | 'removed'>('inactive');

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private progressIntervalId: ReturnType<typeof setInterval> | null = null;
  private startTime = 0;
  private remainingTime = 0;
  private totalTimeOut = 0;

  ngOnInit() {
    this.animationState.set('active');
    if (!this.config.disableTimeOut) {
      this.remainingTime = this.config.timeOut ?? 10000;
      this.totalTimeOut = this.remainingTime;
      this.startTimer();
    }
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  onEnter() {
    if (!this.config.disableTimeOut) {
      this.remainingTime = (this.progress() / 100) * this.totalTimeOut;
      this.clearTimers();
    }
  }

  onLeave() {
    if (!this.config.disableTimeOut) {
      if (!this.config.freezeProgressOnHover) {
        const extendedTimeOut = this.config.extendedTimeOut ?? 10000;
        this.remainingTime = extendedTimeOut;
        this.totalTimeOut = extendedTimeOut;
      }
      this.startTimer();
    }
  }

  onTap() {
    if (this.config.tapToDismiss) {
      this.remove();
    }
  }

  close(event: Event) {
    event.stopPropagation();
    this.remove();
  }

  remove() {
    this.clearTimers();
    this.animationState.set('removed');
    setTimeout(() => {
      this.toastService.removeToast(this.toastId);
    }, 300);
  }

  private startTimer() {
    this.startTime = Date.now();
    const duration = this.remainingTime;
    this.progress.set((duration / this.totalTimeOut) * 100);

    this.progressIntervalId = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const remaining = Math.max(0, duration - elapsed);
      this.progress.set((remaining / this.totalTimeOut) * 100);
    }, 50);

    this.timeoutId = setTimeout(() => {
      this.remove();
    }, duration);
  }

  private clearTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
      this.progressIntervalId = null;
    }
  }
}
