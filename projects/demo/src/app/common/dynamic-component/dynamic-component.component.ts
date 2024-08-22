import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import {
  DynamicOutletComponent,
  OnUpdateInputs
} from '@igo2/common/dynamic-component';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-salutation-component',
  template: '<p>Hello, my name is {{name}}.</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AppSalutationComponent implements OnUpdateInputs {
  @Input() name: string;

  constructor(private cdRef: ChangeDetectorRef) {}

  onUpdateInputs() {
    this.cdRef.detectChanges();
  }
}

@Component({
  selector: 'app-explanation-component',
  template:
    '<p>I am a dynamic component, rendered into an IgoDynamicOutlet.</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AppExplanationComponent implements OnUpdateInputs {
  constructor(private cdRef: ChangeDetectorRef) {}

  onUpdateInputs() {
    this.cdRef.detectChanges();
  }
}

@Component({
  selector: 'app-dynamic-component',
  templateUrl: './dynamic-component.component.html',
  styleUrls: ['./dynamic-component.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    DynamicOutletComponent,
    MatButtonModule
  ]
})
export class AppDynamicComponentComponent {
  component: any = AppSalutationComponent;

  inputs = { name: 'Bob' };

  toggleComponent() {
    this.component =
      this.component === AppSalutationComponent
        ? AppExplanationComponent
        : AppSalutationComponent;
  }
}
