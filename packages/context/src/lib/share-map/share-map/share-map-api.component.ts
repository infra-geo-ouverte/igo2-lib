import { Clipboard } from '@angular/cdk/clipboard';
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
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import type { IgoMap } from '@igo2/geo';
import { uuid } from '@igo2/utils';

import { ContextService, DetailedContext } from '../../context-manager';
import { ShareMapService } from '../shared/share-map.service';

@Component({
  selector: 'igo-share-map-api',
  templateUrl: './share-map-api.component.html',
  styleUrls: ['./share-map-api.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class ShareMapApiComponent implements OnInit {
  public form: UntypedFormGroup;

  @Input() map: IgoMap;

  public url: string;
  public userId: string;
  public idContextShared: string;

  constructor(
    private clipboard: Clipboard,
    private languageService: LanguageService,
    private messageService: MessageService,
    private auth: AuthService,
    private shareMapService: ShareMapService,
    private formBuilder: UntypedFormBuilder,
    private contextService: ContextService
  ) {}

  ngOnInit(): void {
    this.auth.authenticate$.subscribe(() => {
      const decodeToken = this.auth.decodeToken();
      this.userId = decodeToken?.user?.id.toString();
      this.buildForm();
    });
  }

  createUrl(values: any = {}) {
    const inputs = Object.assign({}, values);
    inputs.uri = this.userId ? `${this.userId}-${values.uri}` : values.uri;
    this.url = this.shareMapService.getUrlWithApi(inputs);
    this.createContextShared(this.map, inputs).subscribe(
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
    this._updateContextShared(this.map, inputs, this.idContextShared).subscribe(
      () => {
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

  copyTextToClipboard(textArea: HTMLTextAreaElement) {
    const successful = this.clipboard.copy(textArea.value);
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

  private createContextShared(map: IgoMap, formValues) {
    const context = this.contextService.getContextFromMap(map);
    context.scope = 'public';
    context.title = formValues.title;
    context.uri = formValues.uri;
    return this.contextService.create(context);
  }

  private _updateContextShared(map: IgoMap, formValues, id: string) {
    const context = this.contextService.getContextFromMap(map);
    return this.contextService.update(id, {
      title: formValues.title,
      map: context.map
    } as DetailedContext);
  }
}
