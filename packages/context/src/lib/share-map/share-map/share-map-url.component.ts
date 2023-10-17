import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import { MessageService } from '@igo2/core';
import type { IgoMap } from '@igo2/geo';
import { Clipboard } from '@igo2/utils';

import { Subscription, combineLatest } from 'rxjs';

import { ShareMapService } from '../shared/share-map.service';

@Component({
  selector: 'igo-share-map-url',
  templateUrl: './share-map-url.component.html',
  styleUrls: ['./share-map-url.component.scss']
})
export class ShareMapUrlComponent implements AfterViewInit, OnInit, OnDestroy {
  private mapState$$: Subscription;

  @Input() map: IgoMap;

  public url: string;
  public publicShareOption = {
    layerlistControls: { querystring: '' }
  };

  constructor(
    private messageService: MessageService,
    private shareMapService: ShareMapService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.resetUrl();
    this.mapState$$ = combineLatest([
      this.map.viewController.state$,
      this.map.status$
    ]).subscribe((c) => {
      this.resetUrl();
      this.cdRef.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    this.resetUrl();
  }

  ngOnDestroy(): void {
    this.mapState$$.unsubscribe();
  }

  resetUrl(values: any = {}) {
    this.url = this.shareMapService.getUrlWithoutApi(
      this.map,
      this.publicShareOption
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
}
