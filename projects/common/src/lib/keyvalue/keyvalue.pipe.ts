import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyvalue'
})
export class KeyValuePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const keyValues = [];
    Object.getOwnPropertyNames(value).forEach((key: string) =>
      keyValues.push({ key: key, value: value[key] })
    );

    return keyValues;
  }
}
