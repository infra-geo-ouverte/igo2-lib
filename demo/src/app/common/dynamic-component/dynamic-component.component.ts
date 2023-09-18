import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { OnUpdateInputs } from '@igo2/common';

@Component({
  selector: 'app-salutation-component',
  template: '<p>Hello, my name is {{name}}.</p>',
  changeDetection: ChangeDetectionStrategy.OnPush
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
  changeDetection: ChangeDetectionStrategy.OnPush
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
  styleUrls: ['./dynamic-component.component.scss']
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
