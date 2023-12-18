import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { MessageService } from '@igo2/core';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, MatButtonModule]
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
