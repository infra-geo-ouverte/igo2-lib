import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { OnUpdateInputs } from '@igo2/common/dynamic-component';
import { PanelComponent } from '@igo2/common/panel';
import {
  Tool,
  ToolComponent,
  ToolService,
  Toolbox,
  ToolboxComponent
} from '@igo2/common/tool';

import { BehaviorSubject } from 'rxjs';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@ToolComponent({
  name: 'demo-salutation',
  title: 'Salutation',
  icon: 'person',
  options: { name: 'Jack' }
})
@Component({
  selector: 'app-salutation-tool',
  template: ` <p>Hello, my name is {{ name }}.</p> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AppSalutationToolComponent implements OnUpdateInputs {
  private cdRef = inject(ChangeDetectorRef);

  @Input() name: string;

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
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    PanelComponent,
    MatButtonModule,
    MatIconModule,
    ToolboxComponent,
    AsyncPipe
  ]
})
export class AppToolComponent implements OnInit, OnDestroy {
  private toolService = inject(ToolService);

  toolbox: Toolbox = new Toolbox();

  get activeTool$(): BehaviorSubject<Tool> {
    return this.toolbox.activeTool$;
  }

  get panelTitle(): string {
    return this.activeTool$.value ? this.activeTool$.value.title : 'Toolbox';
  }

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
