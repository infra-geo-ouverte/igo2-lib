import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { Tool } from '../shared/tool.interface';

@Component({
  selector: 'igo-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent {
  @Input()
  get tools(): Tool[] {
    return this._tools;
  }
  set tools(value: Tool[]) {
    this._tools = value;
    this.cdRef.detectChanges();
  }
  private _tools: Tool[] = [];

  @Input()
  get horizontal() {
    return this._horizontal;
  }
  set horizontal(value: boolean) {
    this._horizontal = value;
  }
  private _horizontal = false;

  @Input()
  get withTitle() {
    return this._withTitle;
  }
  set withTitle(value: boolean) {
    this._withTitle = value;
  }
  private _withTitle = true;

  @Input()
  get withIcon() {
    return this._withIcon;
  }
  set withIcon(value: boolean) {
    this._withIcon = value;
  }
  private _withIcon = true;

  @Input()
  get selectedTool(): Tool {
    return this._selectedTool;
  }
  set selectedTool(value: Tool) {
    this._selectedTool = value;
    this.cdRef.detectChanges();
  }
  private _selectedTool: Tool;

  @Output() select = new EventEmitter<Tool>();
  @Output() unselect = new EventEmitter<Tool>();

  @HostBinding('class.with-title')
  get withTitleClass() {
    return this.withTitle;
  }

  @HostBinding('class.with-icon')
  get withIconClass() {
    return this.withIcon;
  }

  @HostBinding('class.horizontal')
  get horizontalClass() {
    return this.horizontal;
  }

  constructor(private cdRef: ChangeDetectorRef) {}
}
