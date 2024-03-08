import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '@igo2/auth';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import type { IgoMap } from '@igo2/geo';
import { Clipboard, uuid } from '@igo2/utils';

import { TranslateModule } from '@ngx-translate/core';

import { ShareMapService } from '../shared/share-map.service';

@Component({
  selector: 'igo-share-map-api',
  templateUrl: './share-map-api.component.html',
  styleUrls: ['./share-map-api.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    TranslateModule
  ]
})
export class ShareMapApiComponent implements OnInit {
  public form: UntypedFormGroup;

  @Input() map: IgoMap;

  public url: string;
  public userId: string;
  public idContextShared: string;

  constructor(
    private languageService: LanguageService,
    private messageService: MessageService,
    private auth: AuthService,
    private shareMapService: ShareMapService,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.auth.authenticate$.subscribe((auth) => {
      const decodeToken = this.auth.decodeToken();
      this.userId = decodeToken?.user?.id.toString();
      this.buildForm();
    });
  }

  createUrl(values: any = {}) {
    const inputs = Object.assign({}, values);
    inputs.uri = this.userId ? `${this.userId}-${values.uri}` : values.uri;
    this.url = this.shareMapService.getUrlWithApi(inputs);
    this.shareMapService.createContextShared(this.map, inputs).subscribe(
      (rep) => {
        this.idContextShared = rep.id;
        this.messageService.success(
          'igo.context.contextManager.dialog.saveMsg',
          'igo.context.contextManager.dialog.saveTitle',
          undefined,
          { value: inputs.title }
        );
      },
      (err) => {
        err.error.title = this.languageService.translate.instant(
          'igo.context.shareMap.errorTitle'
        );
        this.messageService.showError(err);
      }
    );
  }

  updateContextShared(values: any = {}) {
    const inputs = Object.assign({}, values);
    inputs.uri = this.userId ? `${this.userId}-${values.uri}` : values.uri;
    this.shareMapService
      .updateContextShared(this.map, inputs, this.idContextShared)
      .subscribe(
        (rep) => {
          this.messageService.success(
            'igo.context.contextManager.dialog.saveMsg',
            'igo.context.contextManager.dialog.saveTitle',
            undefined,
            { value: inputs.title }
          );
        },
        (err) => {
          err.error.title = this.languageService.translate.instant(
            'igo.context.shareMap.errorTitle'
          );
          this.messageService.showError(err);
        }
      );
  }

  copyTextToClipboard(textArea) {
    const successful = Clipboard.copy(textArea);
    if (successful) {
      this.messageService.success(
        'igo.context.shareMap.dialog.copyMsg',
        'igo.context.shareMap.dialog.copyTitle'
      );
    }
  }

  buildForm(): void {
    this.url = undefined;
    const id = uuid();
    let title = 'Partage ';
    title += this.userId ? `(${this.userId}-${id})` : `(${id})`;
    this.form = this.formBuilder.group({
      title: [title],
      uri: [id]
    });
  }
}
