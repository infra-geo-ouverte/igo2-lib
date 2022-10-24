import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { userAgent } from '@igo2/utils';
import { NetworkService, ConnectionState, MessageService, LanguageService } from '@igo2/core';
import { ConfigService } from '@igo2/core';
import { getEntityTitle, getEntityIcon } from '@igo2/common';
import type { Toolbox } from '@igo2/common';

import { Feature } from '../shared';
import { SearchSource } from '../../search/shared/sources/source';
import { IgoMap } from '../../map/shared/map';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'igo-feature-details',
  templateUrl: './feature-details.component.html',
  styleUrls: ['./feature-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FeatureDetailsComponent implements OnInit, OnDestroy {
  private state: ConnectionState;
  private unsubscribe$ = new Subject<void>();
  ready = false;

  @Input()
  get source(): SearchSource {
    return this._source;
  }
  set source(value: SearchSource) {
    this._source = value;
    this.cdRef.detectChanges();
  }

  @Input() map: IgoMap;

  @Input() toolbox: Toolbox;

  @Input()
  get feature(): Feature {
    return this._feature;
  }
  set feature(value: Feature) {
    this._feature = value;
    this.cdRef.detectChanges();
    this.selectFeature.emit();
  }

  private _feature: Feature;
  private _source: SearchSource;

  @Output() routeEvent = new EventEmitter<boolean>();
  @Output() selectFeature = new EventEmitter<boolean>();
  @Output() htmlDisplayEvent = new EventEmitter<boolean>();

  /**
   * @internal
   */
  get title(): string {
    return getEntityTitle(this.feature);
  }

  /**
   * @internal
   */
  get icon(): string {
    return getEntityIcon(this.feature) || 'link';
  }


  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private networkService: NetworkService,
    private messageService: MessageService,
    private languageService: LanguageService,
    private configService: ConfigService
  ) {
    this.networkService.currentState().pipe(takeUntil(this.unsubscribe$)).subscribe((state: ConnectionState) => {
      this.state = state;
    });
  }

  ngOnInit() {
    this.ready = true;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  urlSanitizer(value): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }


  isHtmlDisplay(): boolean {
    if (this.feature && this.isObject(this.feature.properties) && this.feature.properties.target === 'iframe') {
      this.htmlDisplayEvent.emit(true);
      return true;
    } else {
      this.htmlDisplayEvent.emit(false);
      return false;
    }
  }

  htmlSanitizer(value): SafeResourceUrl {
    if (!value.body || userAgent.getBrowserName() === 'Internet Explorer') {
      return;
    }
    const regexBase = /<base href="[\w:\/\.]+">/;
    if (!regexBase.test(value.body)) {
      const url = new URL(value.url, window.location.origin);
      value.body = value.body.replace('<head>', `<head><base href="${url.origin}">`);
    }

    return this.sanitizer.bypassSecurityTrustHtml(value.body);
  }

  isObject(value) {
    return typeof value === 'object';
  }

  openSecureUrl(value) {
    let url: string;
    const regexDepot = new RegExp(this.configService?.getConfig('depot.url') + '.*?(?="|$)');
    const regexUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

    if (regexDepot.test(value)) {
      url = value.match(regexDepot)[0];

      this.http.get(url, {
        responseType: 'blob'
      })
      .subscribe((docOrImage) => {
        const fileUrl = URL.createObjectURL(docOrImage);
        window.open(fileUrl, '_blank');
        this.cdRef.detectChanges();
      },
      (error: Error) => {
        const translate = this.languageService.translate;
        const title = translate.instant('igo.geo.targetHtmlUrlUnauthorizedTitle');
        const message = translate.instant('igo.geo.targetHtmlUrlUnauthorized');
        this.messageService.error(message, title);
      });
    } else {
      url = value.match(regexUrl)[0];
      window.open(url, '_blank');
    }
  }

  isUrl(value) {
    if (typeof value === 'string') {
      const regex = /^https?:\/\//;
      return regex.test(value);
    }
  }

  isDoc(value) {
    if (typeof value === 'string') {
      if (this.isUrl(value)) {
        const regex = /(pdf|docx?|xlsx?)$/;
        return regex.test(value.toLowerCase());
      } else {
        return false;
      }
    }
  }

  isImg(value) {
    if (typeof value ==='string') {
      if (this.isUrl(value)) {
        const regex = /(jpe?g|png|gif)$/;
        return regex.test(value.toLowerCase());
      } else {
        return false;
      }
    }
  }

  isEmbeddedLink(value) {
    if (typeof value === 'string') {
      const regex = /^<a/;
      return regex.test(value);
    }
  }

  getEmbeddedLinkText(value) {
    const regex = /(?:>).*?(?=<|$)/;
    let text = value.match(regex)[0] as string;
    text = text.replace(/>/g, '');
    return text;
  }

  filterFeatureProperties(feature) {
    const allowedFieldsAndAlias = feature.meta ? feature.meta.alias : undefined;
    const properties = {};
    let offlineButtonState;

    if (this.map) {
      this.map.offlineButtonToggle$.pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
        offlineButtonState = state;
      });
    }

    if (feature.properties && feature.properties.Route && this.toolbox && !this.toolbox.getTool('directions')) {
      delete feature.properties.Route;
    }

    if (allowedFieldsAndAlias) {
      Object.keys(allowedFieldsAndAlias).forEach(field => {
        properties[allowedFieldsAndAlias[field]] = feature.properties[field];
      });
      return properties;
    } else if (offlineButtonState !== undefined) {
      if (!offlineButtonState) {
        if (this.state.connection && feature.meta && feature.meta.excludeAttribute) {
          const excludeAttribute = feature.meta.excludeAttribute;
          excludeAttribute.forEach(attribute => {
            delete feature.properties[attribute];
          });
        } else if (!this.state.connection && feature.meta && feature.meta.excludeAttributeOffline) {
          const excludeAttributeOffline = feature.meta.excludeAttributeOffline;
          excludeAttributeOffline.forEach(attribute => {
            delete feature.properties[attribute];
          });
        }
      } else {
        if (feature.meta && feature.meta.excludeAttributeOffline) {
          const excludeAttributeOffline = feature.meta.excludeAttributeOffline;
          excludeAttributeOffline.forEach(attribute => {
            delete feature.properties[attribute];
          });
        }
      }
    } else {
      if (this.state.connection && feature.meta && feature.meta.excludeAttribute) {
        const excludeAttribute = feature.meta.excludeAttribute;
        excludeAttribute.forEach(attribute => {
          delete feature.properties[attribute];
        });
      } else if (!this.state.connection && feature.meta && feature.meta.excludeAttributeOffline) {
        const excludeAttributeOffline = feature.meta.excludeAttributeOffline;
        excludeAttributeOffline.forEach(attribute => {
          delete feature.properties[attribute];
        });
      }
    }
    return feature.properties;
  }
}
