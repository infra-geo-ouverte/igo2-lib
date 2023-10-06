import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { IgoEntitySelectFieldComponent } from './entity-select-field.component';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ENTIY_RECORD_MOCK,
  ENTIY_TABLE_COLUMN_MOCK
} from '../../__mocks__/entity.mock';

describe('EntitySelectFieldComponent', () => {
  let component: IgoEntitySelectFieldComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IgoEntitySelectFieldComponent],
      imports: [MatSelectModule, MatProgressSpinnerModule, ReactiveFormsModule]
    });
    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Component({
  selector: 'igo-test-wrapper-component',
  template: `<igo-entity-select-field
    [control]="this.formGroup.get([column.name])"
    [relation]="column.relation"
    [domainValues]="column.domainValues"
    [record]="record"
    [multiple]="column.multiple"
  ></igo-entity-select-field>`
})
class TestWrapperComponent {
  formGroup: FormGroup;
  column = ENTIY_TABLE_COLUMN_MOCK;
  record = ENTIY_RECORD_MOCK;

  constructor() {
    this.formGroup = new FormGroup({
      [this.column.name]: new FormControl()
    });
  }
}
