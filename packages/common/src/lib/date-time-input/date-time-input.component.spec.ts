import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatNativeDateModule } from '@angular/material/core';

// import { MaterialModule } from './../material/material.module';
import { DateTimeInputComponent } from './date-time-input.component';

@Component({
  selector: `igo-host-component`,
  template: `
    <div *ngIf="form" [formGroup]="form">
      <mat-form-field>
        <igo-date-time-input
            [required]="true"
            placeholder="Date et heure"
            formControlName="datetime">
        </igo-date-time-input>
      </mat-form-field>
    </div>`
})
class TestHostComponent implements OnInit {
  @ViewChild(DateTimeInputComponent)
  public datetimeInputComponent: DateTimeInputComponent;

  public form: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      datetime: null
    });
  }
}

describe('DateTimeInputComponent', () => {

  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatNativeDateModule,
        BrowserAnimationsModule
      ],
      declarations: [
        TestHostComponent,
        DateTimeInputComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    expect(hostComponent.datetimeInputComponent).toBeTruthy();
  });
});
