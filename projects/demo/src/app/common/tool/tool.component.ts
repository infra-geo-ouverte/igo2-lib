import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  IgoPanelModule,
  IgoToolboxModule,
  OnUpdateInputs,
  Tool,
  ToolComponent,
  ToolService,
  Toolbox
} from '@igo2/common';

import { BehaviorSubject } from 'rxjs';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@ToolComponent({
  name: 'demo-salutation',
  title: 'Salutation',
  icon: 'account',
  options: { name: 'Jack' }
})
@Component({
  selector: 'app-salutation-tool',
  template: ` <p>Hello, my name is {{ name }}.</p> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AppAboutToolComponent {}

@Component({
  selector: 'app-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    IgoPanelModule,
    NgIf,
    MatButtonModule,
    MatIconModule,
    IgoToolboxModule,
    AsyncPipe
  ]
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
