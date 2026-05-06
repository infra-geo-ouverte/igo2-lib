import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyvalue'
})
export class KeyValuePipe implements PipeTransform {
  transform(value: any): { key: string; value: any }[] {
    const keyValues: { key: string; value: any }[] = [];
    if (value) {
      Object.getOwnPropertyNames(value).forEach((key: string) =>
        keyValues.push({ key, value: value[key] })
      );
    }

    return keyValues;
  }
}
