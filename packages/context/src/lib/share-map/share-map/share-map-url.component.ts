import { Clipboard } from '@angular/cdk/clipboard';
import { NgIf } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { CustomHtmlComponent } from '@igo2/common/custom-html';
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { RouteService } from '@igo2/core/route';
import type { IgoMap } from '@igo2/geo';

import { Subscription, combineLatest } from 'rxjs';

import { ContextService } from '../../context-manager/shared/context.service';
import { ShareOption } from '../shared/share-map.interface';
import { ShareMapService } from '../shared/share-map.service';

@Component({
  selector: 'igo-share-map-url',
  templateUrl: './share-map-url.component.html',
  styleUrls: ['./share-map-url.component.scss'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    NgIf,
    CustomHtmlComponent,
    IgoLanguageModule
  ]
})
export class ShareMapUrlComponent implements OnInit, OnDestroy {
  private mapState$$: Subscription;

  @Input() map: IgoMap;

  public url: string;
  private publicShareOption: ShareOption = {
    layerlistControls: { querystring: '' }
  };
  private language: string;

  constructor(
    private clipboard: Clipboard,
    private messageService: MessageService,
    private shareMapService: ShareMapService,
    private contextService: ContextService,
    private cdRef: ChangeDetectorRef,
    private route: RouteService
  ) {
    this.route.queryParams.subscribe((params) => {
      const lang = params[this.route.options.languageKey];
      if (lang) {
        this.language = lang;
      }
    });
  }

  ngOnInit(): void {
    this.generateUrl();
    this.mapState$$ = combineLatest([
      this.map.viewController.state$,
      this.map.status$
    ]).subscribe(() => {
      this.generateUrl();
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.mapState$$?.unsubscribe();
  }

  generateUrl(): void {
    this.url = this.shareMapService.encoder.generateUrl(
      this.map,
      this.contextService.context$.value,
      this.publicShareOption,
      this.language
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
}
