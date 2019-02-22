import {
  trigger,
  state,
  style,
  transition,
  animate,
  AnimationTriggerMetadata
} from '@angular/animations';

export function toolSlideInOut(
  speed = '300ms',
  type = 'ease-in-out'
): AnimationTriggerMetadata {
  return trigger('toolSlideInOut', [
    state(
      'left',
      style({
        transform: 'translate3d(-100%, 0, 0)'
      })
    ),
    state(
      'center',
      style({
        transform: 'translate3d(0, 0, 0)'
      })
    ),
    state(
      'right',
      style({
        transform: 'translate3d(100%, 0, 0)'
      })
    ),
    transition('left => center', animate(speed + ' ' + type)),
    transition('right => center', animate(speed + ' ' + type))
  ]);
}
