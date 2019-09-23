import { Injectable, EventEmitter, OnDestroy, Injector } from '@angular/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';

import { Network } from '@ionic-native/network/ngx';
import { Platform } from '@ionic/angular';

import { MessageService } from '../message/shared/message.service';
import { LanguageService } from '../language/shared/language.service';

export interface ConnectionState {
  connection: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService implements OnDestroy {

  private stateChangeEventEmitter = new EventEmitter<ConnectionState>();
  private onlineSubscription: Subscription;
  private offlineSubscription: Subscription;
  private connectionType: string;

  private state: ConnectionState = {
    connection: window.navigator.onLine
  };

  constructor(
    private messageService: MessageService,
    private injector: Injector,
    private network: Network,
    private platform: Platform
    ) {
      this.checkNetworkState();
      this.platform.ready().then(() => {
        if (this.platform.is('cordova')) {
          if (this.platform.is('android')) {
            this.checkNetworkStateMobile();
          }
        } else {
          console.log('browser');
          this.checkNetworkState();
        }
      });
    }

  private checkNetworkState() {
    this.onlineSubscription = fromEvent(window, 'online').subscribe(() => {
      const translate = this.injector.get(LanguageService).translate;
      const message = translate.instant('igo.core.network.online.message');
      const title = translate.instant('igo.core.network.online.title');
      this.messageService.info(message, title);
      this.state.connection = true;
      this.emitEvent();
    });

    this.offlineSubscription = fromEvent(window, 'offline').subscribe(() => {
      const translate = this.injector.get(LanguageService).translate;
      const message = translate.instant('igo.core.network.offline.message');
      const title = translate.instant('igo.core.network.offline.title');
      this.messageService.info(message, title);
      this.state.connection = false;
      this.emitEvent();
    });
  }

  private checkNetworkStateMobile() {
    if (this.network.type !== this.network.Connection.NONE) {
      this.connectionType = this.network.type;
      this.state.connection = true;
    }

    this.offlineSubscription = this.network.onDisconnect().subscribe(() => {
      this.state.connection = false;
      setTimeout(() => {
        if (!this.state.connection) {
          const translate = this.injector.get(LanguageService).translate;
          const message = translate.instant('igo.core.network.offline.message');
          const title = translate.instant('igo.core.network.offline.title');
          this.messageService.info(message, title);
          this.state.connection = false;
          this.emitEvent();
        }
      }, 10000);
    });

    this.onlineSubscription = this.network.onConnect().subscribe(() => {
      this.state.connection = true;
      setTimeout(() => {
        if (this.state.connection) {
          const translate = this.injector.get(LanguageService).translate;
          const message = translate.instant('igo.core.network.online.message');
          const title = translate.instant('igo.core.network.online.title');
          this.messageService.info(message, title);
          this.state.connection = true;
          this.emitEvent();
        }
      }, 10000);
    });
  }

  private emitEvent() {
    this.stateChangeEventEmitter.emit(this.state);
  }

  ngOnDestroy(): void {
    try {
      this.offlineSubscription.unsubscribe();
      this.onlineSubscription.unsubscribe();
    } catch (e) {
    }
  }

  currentState(reportState = true): Observable<ConnectionState> {
    return reportState ?
    this.stateChangeEventEmitter.pipe(
      debounceTime(300),
      startWith(this.state),
    )
    :
    this.stateChangeEventEmitter.pipe(
      debounceTime(300)
    );
  }
}
