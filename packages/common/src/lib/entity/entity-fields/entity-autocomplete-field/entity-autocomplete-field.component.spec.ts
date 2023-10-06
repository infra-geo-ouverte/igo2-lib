import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoEntityAutocompleteFieldComponent } from './entity-autocomplete-field.component';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Component } from '@angular/core';
import { EntityRecord, EntityTableColumn } from '../../shared';
import { FormControl, FormGroup } from '@angular/forms';

describe('IgoEntityAutocompleteFieldComponent', () => {
  let component: IgoEntityAutocompleteFieldComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IgoEntityAutocompleteFieldComponent],
      imports: [MatAutocompleteModule, MatInputModule]
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
  template: `<igo-entity-autocomplete-field
    [control]="this.formGroup.get([column.name])"
    [column]="column"
    [record]="record"
  ></igo-entity-autocomplete-field>`
})
class TestWrapperComponent {
  formGroup: FormGroup;
  column: EntityTableColumn = {
    name: 'test',
    title: 'Test'
  };
  record: EntityRecord<any> = {
    entity: {},
    state: {},
    revision: 0,
    ref: 'test'
  };

  constructor() {
    this.formGroup = new FormGroup({
      [this.column.name]: new FormControl()
    });
  }
}
