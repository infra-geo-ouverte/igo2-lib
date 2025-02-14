import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { MessageService } from '@igo2/core/message';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  imports: [DocViewerComponent, ExampleViewerComponent, MatButtonModule]
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
