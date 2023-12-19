import { EventEmitter, Injectable, Injector, OnDestroy } from '@angular/core';

import { Observable, Subscription, fromEvent } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';

import { MessageService } from '../message/shared/message.service';
import { ConnectionState } from './network.interfaces';

@Injectable({
  providedIn: 'root'
})
export class NetworkService implements OnDestroy {
  private stateChangeEventEmitter = new EventEmitter<ConnectionState>();
  private onlineSubscription: Subscription;
  private offlineSubscription: Subscription;
  private previousMessageId;

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
      if (this.previousMessageId) {
        this.messageService.remove(this.previousMessageId);
      }
      const messageObj = this.messageService.info(
        'igo.core.network.online.message',
        'igo.core.network.online.title'
      );
      this.previousMessageId = messageObj.toastId;
      this.state.connection = true;
      this.emitEvent();
    });

    this.offlineSubscription = fromEvent(window, 'offline').subscribe(() => {
      if (this.previousMessageId) {
        this.messageService.remove(this.previousMessageId);
      }
      const messageObj = this.messageService.info(
        'igo.core.network.offline.message',
        'igo.core.network.offline.title'
      );
      this.previousMessageId = messageObj.toastId;
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
    } catch (e) {}
  }

  currentState(reportState = true): Observable<ConnectionState> {
    return reportState
      ? this.stateChangeEventEmitter.pipe(
          debounceTime(300),
          startWith(this.state)
        )
      : this.stateChangeEventEmitter.pipe(debounceTime(300));
  }
}
