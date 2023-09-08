import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { DynamicComponent, OnUpdateInputs, WidgetComponent, WidgetService } from '@igo2/common';

@Component({
  selector: 'app-salutation-widget',
  template: `
    <p>Hello, my name is {{name}}.</p>
    <button mat-flat-button (click)="complete.emit(name)">Nice to meet you</button>
    <button mat-flat-button (click)="cancel.emit(name)">Dismiss</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSalutationWidgetComponent implements OnUpdateInputs, WidgetComponent {

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
  styleUrls: ['./widget.component.scss']
})
export class AppWidgetComponent {

  widget: DynamicComponent<WidgetComponent>;

  inputs = {name: 'Bob'};

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
