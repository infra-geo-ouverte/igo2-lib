import { Component } from '@angular/core';

import { MessageService } from '@igo2/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class AppMessageComponent {
  constructor(private messageService: MessageService) {}

  success() {
    this.messageService.success('Congratulations', 'Success');
  }

  info() {
    this.messageService.info('Welcome to IGO', 'Info');
  }

  alert() {
    this.messageService.alert('Warning', 'Alert');
  }
  error() {
    this.messageService.error('There is a bug', 'Error');
  }
}
