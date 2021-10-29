import { Component, ViewChild, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldControl } from '@angular/material/form-field';

import { MaterialModule } from '../material/material.module';
import { CustomFormControlDirective } from './custom-form-control.directive';

@Component({
  selector: `test-component`,
  template: ``,
  providers: [{ provide: MatFormFieldControl, useExisting: TestComponent }]
})
class TestComponent extends CustomFormControlDirective<string> implements OnInit {

  private _value: string;

  protected isEmpty(): boolean {
    return this._value ? true : false;
  }

  protected enable() { }

  protected disable() { }

  protected getValue(): string {
    return this._value;
  }

  protected setValue(value: string) {
    this._value = value;
  }
}

@Component({
  selector: `host-component`,
  template: `
    <div [formGroup]="form">
      <mat-form-field>
        <test-component formControlName="input">
        </test-component>
      </mat-form-field>
    </div>`
})
class TestHostComponent {
  @ViewChild(TestComponent)
  public testComponent: TestComponent;

  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      input: ''
    });
  }
}

describe('CustomFormControlComponent', () => {

  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        TestHostComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    expect(hostComponent.testComponent).toBeTruthy();
  });
});
