import { Component } from '@angular/core';

import { MessageService } from '@igo2/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class AppMessageComponent {
  constructor(private messageService: MessageService) {}

  success(): void {
    this.messageService.success('Congratulations', 'Success');
  }

  info(): void {
    this.messageService.info('Welcome to IGO', 'Info');
  }

  alert(): void {
    this.messageService.alert('Warning', 'Alert');
  }
  error(): void {
    this.messageService.error('There is a bug', 'Error');
  }
}
