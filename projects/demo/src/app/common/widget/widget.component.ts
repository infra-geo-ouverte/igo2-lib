import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import {
  DynamicComponent,
  OnUpdateInputs
} from '@igo2/common/dynamic-component';
import {
  IgoWidgetOutletModule,
  WidgetComponent,
  WidgetService
} from '@igo2/common/widget';

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
  imports: [MatButtonModule]
})
export class AppSalutationWidgetComponent
  implements OnUpdateInputs, WidgetComponent
{
  private cdRef = inject(ChangeDetectorRef);

  @Input() name: string;

  @Output() complete = new EventEmitter<string>();

  @Output() cancel = new EventEmitter<string>();

  onUpdateInputs() {
    this.cdRef.detectChanges();
  }
}

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  imports: [DocViewerComponent, ExampleViewerComponent, IgoWidgetOutletModule]
})
export class AppWidgetComponent {
  private widgetService = inject(WidgetService);

  widget: DynamicComponent<WidgetComponent>;

  inputs = { name: 'Bob' };

  constructor() {
    this.widget = this.widgetService.create(AppSalutationWidgetComponent);
  }

  onWidgetComplete(name: string): void {
    alert(`${name} emitted event 'complete' then got automatically destroyed.`);
  }

  onWidgetCancel(): void {
    alert(`Widget emitted event 'cancel' then got automatically destroyed.`);
  }
}
