import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityTableChoiceCellComponent } from './entity-table-choice-cell.component';
import { Component } from '@angular/core';
import {
  ENTIY_RECORD_MOCK,
  ENTIY_TABLE_COLUMN_MOCK
} from '../../__mocks__/entity.mock';

describe('EntityTableChoiceCellComponent', () => {
  let component: EntityTableChoiceCellComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityTableChoiceCellComponent]
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
  template: `<igo-entity-table-choice-cell
    [column]="column"
    [record]="record"
  ></igo-entity-table-choice-cell>`
})
class TestWrapperComponent {
  column = ENTIY_TABLE_COLUMN_MOCK;
  record = ENTIY_RECORD_MOCK;
}
