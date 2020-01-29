import { Injectable } from '@angular/core';
import { GestureConfig, HammerManager } from '@angular/material';

@Injectable()
export class IgoGestureConfig extends GestureConfig {
  buildHammer(element: HTMLElement) {
    const mc = super.buildHammer(element) as HammerManager;
    mc.set({ touchAction: 'pan-y' });
    return mc;
  }
}
