import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import {
  DynamicComponent,
  IgoWidgetOutletModule,
  OnUpdateInputs,
  WidgetComponent,
  WidgetService
} from '@igo2/common';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-salutation-widget',
  template: `
    <p>Hello, my name is {{ name }}.</p>
    <button mat-flat-button (click)="complete.emit(name)">
      Nice to meet you
    </button>
    <button mat-flat-button (click)="cancel.emit(name)">Dismiss</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule]
})
export class AppSalutationWidgetComponent
  implements OnUpdateInputs, WidgetComponent
{
  @Input() name: string;

  @Output() complete = new EventEmitter<string>();

  @Output() cancel = new EventEmitter<string>();

  constructor(private cdRef: ChangeDetectorRef) {}

  onUpdateInputs() {
    this.cdRef.detectChanges();
  }
}

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, IgoWidgetOutletModule]
})
export class AppWidgetComponent {
  widget: DynamicComponent<WidgetComponent>;

  inputs = { name: 'Bob' };

  constructor(private widgetService: WidgetService) {
    this.widget = this.widgetService.create(AppSalutationWidgetComponent);
  }

  onWidgetComplete(name: string) {
    alert(`${name} emitted event 'complete' then got automatically destroyed.`);
  }

  onWidgetCancel() {
    alert(`Widget emitted event 'cancel' then got automatically destroyed.`);
  }
}
