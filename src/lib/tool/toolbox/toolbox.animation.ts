import { trigger, state, style, transition,
         animate, AnimationTriggerMetadata } from '@angular/animations';

export function toolSlideInOut(
    speed = '300ms', type = 'ease-in-out'): AnimationTriggerMetadata {

  return trigger('toolSlideInOut', [
    state('left',   style({
      transform: 'translate3d(-100%, 0, 0)',
      display: 'none'
    })),
    state('center',   style({
      transform: 'translate3d(0, 0, 0)',
      display: 'block'
    })),
    state('right', style({
      transform: 'translate3d(100%, 0, 0)',
      display: 'none'
    })),
    transition('left => center', animate(speed + ' ' + type)),
    transition('right => center', animate(speed + ' ' + type)),
    transition('center => right', animate('0ms ' + type)),
    transition('center => left', animate('0ms ' + type)),
  ]);
};
