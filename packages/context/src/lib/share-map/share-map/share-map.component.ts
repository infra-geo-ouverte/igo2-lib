import { AfterViewInit, Component, Input, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { uuid, Clipboard } from '@igo2/utils';
import { ConfigService, MessageService, LanguageService } from '@igo2/core';
import { AuthService } from '@igo2/auth';
import { IgoMap, LayerListControlsOptions } from '@igo2/geo';

import { ShareMapService } from '../shared/share-map.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'igo-share-map',
  templateUrl: './share-map.component.html',
  styleUrls: ['./share-map.component.scss']
})
export class ShareMapComponent implements AfterViewInit, OnInit, OnDestroy {
  public form: FormGroup;
  private mapState$$: Subscription;

  @Input() map: IgoMap;

  @Input() layerListControls: LayerListControlsOptions;

  public url: string;
  public hasApi = false;
  public userId;
  public publicShareOption = {
    layerlistControls: { querystring: '' }
  };

  constructor(
    private config: ConfigService,
    private languageService: LanguageService,
    private messageService: MessageService,
    private auth: AuthService,
    private shareMapService: ShareMapService,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    this.hasApi = this.config.getConfig('context.url') ? true : false;
  }

  ngOnInit(): void {
    this.auth.authenticate$.subscribe(auth => {
      const decodeToken = this.auth.decodeToken();
      this.userId = decodeToken.user ? decodeToken.user.id : undefined;
      this.url = undefined;
      this.buildForm();
    });
    this.mapState$$ = this.map.viewController.state$.subscribe(c => {
      if (!this.hasApi) {
        this.resetUrl();
        this.cdRef.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.hasApi) {
      this.resetUrl();
    }
  }

  ngOnDestroy(): void {
    this.mapState$$.unsubscribe();
  }

  private hasLayerListControls(): boolean {
    if (this.layerListControls) {
        this.publicShareOption.layerlistControls.querystring = '';
        if (this.layerListControls.keyword !== undefined || this.layerListControls.keyword !== '' ) {
          this.publicShareOption.layerlistControls.querystring += '&llck=' + this.layerListControls.keyword;
        }
        if (this.layerListControls.sortAlpha) {
          this.publicShareOption.layerlistControls.querystring += '&llca=1';
        }
        if (this.layerListControls.onlyVisible) {
          this.publicShareOption.layerlistControls.querystring += '&llcv=1';
        }
        return true;
    }
    return false;
  }

  resetUrl(values: any = {}) {
    this.hasLayerListControls();
    const inputs = Object.assign({}, values);
    inputs.uri = this.userId ? `${this.userId}-${values.uri}` : values.uri;
    this.url = this.shareMapService.getUrl(this.map, inputs, this.publicShareOption);
  }

  copyTextToClipboard(textArea) {
    const successful = Clipboard.copy(textArea);
    if (successful) {
      const translate = this.languageService.translate;
      const title = translate.instant(
        'igo.context.shareMap.dialog.copyTitle'
      );
      const msg = translate.instant('igo.context.shareMap.dialog.copyMsg');
      this.messageService.success(msg, title);
    }
  }

  private buildForm(): void {
    const id = uuid();
    let title = 'Partage ';
    title += this.userId ? `(${this.userId}-${id})` : `(${id})`;
    this.form = this.formBuilder.group({
      title: [title],
      uri: [id]
    });
  }
}
