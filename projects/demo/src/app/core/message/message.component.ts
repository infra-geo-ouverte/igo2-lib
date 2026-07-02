import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { MessageService, MessageType } from '@igo2/core/message';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  imports: [DocViewerComponent, ExampleViewerComponent, MatButtonModule]
})
export class AppMessageComponent {
  private messageService = inject(MessageService);

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

  successWithIcon(): void {
    this.messageService.message({
      type: MessageType.SUCCESS,
      text: 'Operation completed successfully',
      title: 'Success',
      showIcon: true
    });
  }

  infoWithIcon(): void {
    this.messageService.message({
      type: MessageType.INFO,
      text: 'Welcome to IGO',
      title: 'Info',
      showIcon: true
    });
  }

  alertWithIcon(): void {
    this.messageService.message({
      type: MessageType.ALERT,
      text: 'Please review your inputs',
      title: 'Alert',
      showIcon: true
    });
  }

  errorWithIcon(): void {
    this.messageService.message({
      type: MessageType.ERROR,
      text: 'An unexpected error occurred',
      title: 'Error',
      showIcon: true
    });
  }

  htmlContent(): void {
    this.messageService.message({
      type: MessageType.INFO,
      text: `
      <h1 style="margin-top: 0px !important;">Big SDG Title</h1>
      <p>
        Visit our <a href="https://igo2.github.io" target="_blank" style="color:#fff;font-weight:bold;">documentation</a> for more details.<br><em>Click to dismiss.</em>
      </p>
      `,
      title: 'HTML Content',
      showIcon: true,
      options: { enableHtml: true }
    });
  }
}
