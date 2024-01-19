import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  OnUpdateInputs,
  Tool,
  ToolComponent,
  ToolService,
  Toolbox
} from '@igo2/common';

import { BehaviorSubject } from 'rxjs';

@ToolComponent({
  name: 'demo-salutation',
  title: 'Salutation',
  icon: 'account',
  options: { name: 'Jack' }
})
@Component({
  selector: 'app-salutation-tool',
  template: ` <p>Hello, my name is {{ name }}.</p> `,
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
  name: 'demo-about',
  title: 'About',
  icon: 'information'
})
@Component({
  selector: 'app-about-tool',
  template: ` <p>I'm a tool inside a toolbox.</p> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppAboutToolComponent {}

@Component({
  selector: 'app-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.scss']
})
export class AppToolComponent implements OnInit, OnDestroy {
  toolbox: Toolbox = new Toolbox();

  get activeTool$(): BehaviorSubject<Tool> {
    return this.toolbox.activeTool$;
  }

  get panelTitle(): string {
    return this.activeTool$.value ? this.activeTool$.value.title : 'Toolbox';
  }

  constructor(
    private toolService: ToolService
  ) {}

  ngOnInit(): void {
    this.toolbox.setToolbar(['demo-salutation', 'demo-about']);
    this.toolbox.setTools(this.toolService.getTools());
  }

  ngOnDestroy(): void {
    this.toolbox.destroy();
  }

  activateSalutationTool(): void {
    this.toolbox.activateTool('demo-salutation', { name: 'Bob' });
  }
}
