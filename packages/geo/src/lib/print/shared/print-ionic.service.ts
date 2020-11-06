import { Injectable } from '@angular/core';
import * as jsPDF from 'jspdf';
import { Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';

import { MessageService, ActivityService, LanguageService } from '@igo2/core';
import { PrintService } from './print.service';

@Injectable({
  providedIn: 'root'
})
export class PrintIonicService extends PrintService {
  date: Date;
  day: string;
  month: any;
  hour: string;
  minute: string;
  year: string;

  constructor(
    messageService: MessageService,
    activityService: ActivityService,
    languageService: LanguageService,
    private platform: Platform,
    private fileOpener: FileOpener,
    private file: File
  ) {
    super(messageService, activityService, languageService);
  }

  protected saveDoc(doc: jsPDF) {
    if (this.platform.is('cordova')) {
      const docOutput = doc.output();
      const buffer = new ArrayBuffer(docOutput.length);
      const array = new Uint8Array(buffer);
      this.setDate();
      for (let i = 0; i < docOutput.length; i++) {
          array[i] = docOutput.charCodeAt(i);
      }
      const fileName = 'map' + this.year + '-' + this.month + '-' + this.day + '-' + this.hour + '-' + this.minute + '.pdf';
      const directory = this.file.externalRootDirectory + 'Download';
      this.file.writeFile(directory, fileName, buffer, { replace: true }).then((success) =>
        this.fileOpener.open(directory + '/' + fileName, 'application/pdf'));
    } else {
        super.saveDoc(doc);
    }
  }
  private setDate() {
      this.date = new Date();
      this.day = this.date.getDate().toString();
      this.month = this.date.getMonth() + 1;
      if (this.month < 10) {
        this.month = '0' + this.month.toString();
      } else {
          this.month = this.month.toString();
      }
      this.year = this.date.getFullYear().toString();
      this.hour = this.date.getHours().toString();
      this.minute = this.date.getMinutes().toString();
  }
}
