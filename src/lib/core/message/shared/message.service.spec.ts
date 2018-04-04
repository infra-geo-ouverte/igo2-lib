import { TestBed, inject } from '@angular/core/testing';
import { NotificationsService } from 'angular2-notifications';

import { ConfigService } from '../../config';
import { MessageService } from '.';

describe('MessageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        NotificationsService,
        MessageService,
        ConfigService
      ]
    });
  });

  it('should ...', inject([MessageService], (service: MessageService) => {
    expect(service).toBeTruthy();
  }));
});
