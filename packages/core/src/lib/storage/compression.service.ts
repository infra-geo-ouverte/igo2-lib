import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { CompressedData } from './compressedData.interface';

function getNumber(v: number, endposition: number, length: number) {
  /* tslint:disable:no-bitwise*/
  const mask = ((1 << length) - 1);
  return (v >> endposition) & mask;
  /* tslint:enable:no-bitwise*/
}

@Injectable({
  providedIn: 'root'
})
export class CompressionService {
  private base64Index = new Map<string, number>();
  private indexBase64 = new Map<number, string>();

  constructor() {
    this.generateBase64Index();
  }

  private generateBase64Index() {
    // https://fr.wikipedia.org/wiki/Base64
    // A-Z => [0, 25]
    for (let i = 0; i < 26; i++) {
      this.base64Index.set(String.fromCharCode('A'.charCodeAt(0) + i), i);
      this.indexBase64.set(i, String.fromCharCode('A'.charCodeAt(0) + i));
    }
    // a-z => [26, 51]
    for (let i = 0; i < 26; i++) {
      this.base64Index.set(String.fromCharCode('a'.charCodeAt(0) + i), i + 26);
      this.indexBase64.set(i + 26, String.fromCharCode('a'.charCodeAt(0) + i));
    }
    // 0-9 => [52, 61]
    for (let i = 0; i < 10; i++) {
      this.base64Index.set(String.fromCharCode('0'.charCodeAt(0) + i), i + 52);
      this.indexBase64.set(i + 52, String.fromCharCode('0'.charCodeAt(0) + i));
    }
    // + / => [62, 63]
    this.base64Index.set('+', 62);
    this.base64Index.set('/', 63);
    this.indexBase64.set(62, '+');
    this.indexBase64.set(63, '/');
  }

  compressBlob(blob: Blob): Observable<CompressedData> {
    if (!blob) {
      return;
    }

    const observable = new Observable((observer: Observer<CompressedData>) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const base64 = reader.result.valueOf() as string;
        const text64 = base64.substr(base64.indexOf(',') + 1);
        const compressed = this.compressStringBase64(text64);
        const compressedData: CompressedData = { length: text64.length,
                                                 type: blob.type,
                                                 object: compressed };
        observer.next(compressedData);
      };
    });
    return observable;
  }

  decompressBlob(compressedData: CompressedData): Blob {
    /* tslint:disable:no-bitwise*/
    const object = compressedData.object;
    const length = compressedData.length;
    const decompressed: string = this.decompressStringBase64(object, length);
    const byteCharacters = atob(decompressed);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: compressedData.type});
    /* tslint:enable:no-bitwise*/
    return blob;
  }

  private compressStringBase64(s: string): string {
    /* tslint:disable:no-bitwise*/
    let out = '';
    let bits = 16;
    let chr = 0;
    let rem = 0;
    for (const c of s) {
      const value = this.base64Index.get(c);
      if (bits > 6) {
        bits -= 6;
        chr += value << bits;
      } else {
        rem = 6 - bits;
        chr += value >> rem;
        out += String.fromCharCode(chr);
        chr = (value) << (16 - rem);
        bits = 16 - rem;
      }
    }
    if (s.length % 8 !== 0) {
      out += String.fromCharCode(chr);
    }
    /* tslint:enable:no-bitwise*/
    return String.fromCharCode(9731) + out;
  }

  private decompressStringBase64(c: string, length: number): string {
     /* tslint:disable:no-bitwise*/
    if (!c) {
      return;
    }

    if (c.charCodeAt(0) !== 9731) {
      return c;
    }

    let chr = 0;
    let rem = 0;
    let bits = 16;
    let out = '';
    let j = 1;
    let value = c.charCodeAt(j);
    for (let i = 0; i < length; i++) {
      if (bits > 6) {
        bits -= 6;
        chr = getNumber(value, bits, 6);
        out += this.indexBase64.get(chr);
      } else {
        rem = 6 - bits;
        chr = getNumber(value, 0, bits) << rem;
        value = c.charCodeAt(++j);
        chr += getNumber(value, 16 - rem, rem);
        out += this.indexBase64.get(chr);
        bits = 16 - rem;
      }
    }
    return out;
    /* tslint:enable:no-bitwise*/
  }
}
