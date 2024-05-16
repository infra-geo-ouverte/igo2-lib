import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clone',
  standalone: true
})
export class ClonePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value === undefined) {
      return value;
    }

    if (value instanceof Array) {
      return value.map((obj) => Object.assign(Object.create(obj), obj));
    } else {
      return Object.assign(Object.create(value), value);
    }
  }
}
