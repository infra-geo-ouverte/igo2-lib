import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyvalue',
  standalone: true
})
export class KeyValuePipe implements PipeTransform {
  transform(value: any): any {
    const keyValues = [];
    Object.getOwnPropertyNames(value).forEach((key: string) =>
      keyValues.push({ key, value: value[key] })
    );

    return keyValues;
  }
}
