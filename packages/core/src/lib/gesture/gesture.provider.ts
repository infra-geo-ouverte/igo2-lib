import { Injectable } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';

@Injectable()
export class IgoGestureConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement) {
    const mc = super.buildHammer(element) as any;
    mc.set({ touchAction: 'pan-y' });
    return mc;
  }
}
