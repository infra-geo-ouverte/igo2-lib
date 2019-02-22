import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import {
  OnUpdateInputs,
  Tool,
  Toolbox,
  ToolComponent,
  ToolService
} from '@igo2/common';

@ToolComponent({
  name: 'salutation',
  title: 'Salutation',
  icon: 'person',
  options: {name: 'Jack'}
})
@Component({
  selector: 'app-salutation-tool',
  template: `
    <p>Hello, my name is {{name}}.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSalutationToolComponent implements OnUpdateInputs {

  @Input() name: string;

  constructor(private cdRef: ChangeDetectorRef) {}

  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

}

@ToolComponent({
  name: 'about',
  title: 'About',
  icon: 'info'
})
@Component({
  selector: 'app-about-tool',
  template: `
    <p>I'm a tool inside a toolbox.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppAboutToolComponent {}

@Component({
  selector: 'app-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.scss']
})
export class AppToolComponent implements OnInit, OnDestroy {

  toolbox = new Toolbox();

  get activeTool$(): BehaviorSubject<Tool> {
    return this.toolbox.activeTool$;
  }

  get panelTitle(): string {
    return this.activeTool$.value ? this.activeTool$.value.title : 'Toolbox';
  }

  constructor(private toolService: ToolService) {}

  ngOnInit() {
    this.toolbox.setTools(this.toolService.getTools());
  }

  ngOnDestroy() {
    this.toolbox.destroy();
  }

  activateSalutationTool() {
    this.toolbox.activateTool('salutation', {name: 'Bob'});
  }

}
