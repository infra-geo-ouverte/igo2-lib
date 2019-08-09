import { Injectable, EventEmitter, OnDestroy, AfterViewInit, OnInit, Injector } from '@angular/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';

import { MessageService } from '../message';
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

  private state: ConnectionState = {
    connection: window.navigator.onLine
  };

  constructor(
    private messageService: MessageService,
    private injector: Injector
    ) {
    this.checkNetworkState();
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
