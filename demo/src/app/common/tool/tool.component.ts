import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { LanguageService } from '@igo2/core';
import {
  OnUpdateInputs,
  Tool,
  Toolbox,
  ToolComponent,
  ToolService
} from '@igo2/common';

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
  toolbox = new Toolbox();

  get activeTool$(): BehaviorSubject<Tool> {
    return this.toolbox.activeTool$;
  }

  get panelTitle(): string {
    return this.activeTool$.value ? this.activeTool$.value.title : 'Toolbox';
  }

  constructor(
    private toolService: ToolService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.toolbox.setToolbar(['demo-salutation', 'demo-about']);
    this.toolbox.setTools(this.toolService.getTools());
  }

  ngOnDestroy() {
    this.toolbox.destroy();
  }

  activateSalutationTool() {
    this.toolbox.activateTool('demo-salutation', { name: 'Bob' });
  }
}
